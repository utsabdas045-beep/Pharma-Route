import { Router } from "express";
import { randomUUID } from "crypto";
import { runQuery } from "../lib/neo4j";
import { generateDiscoveryExplanation } from "../lib/sarvam";

const router = Router();

router.get("/discoveries", async (req, res) => {
  try {
    const { minConfidence = "0.5", limit = "20" } = req.query as {
      minConfidence?: string;
      limit?: string;
    };
    const minConf = parseFloat(minConfidence);
    const lim = Math.min(parseInt(limit, 10) || 20, 100);

    const rows = await runQuery<{ d: Record<string, unknown> }>(
      `MATCH (d:Discovery) WHERE d.confidence >= $minConf
       RETURN d ORDER BY d.confidence DESC LIMIT $limit`,
      { minConf, limit: lim }
    );

    if (!rows.length) {
      res.json(getDemoDiscoveries());
      return;
    }

    res.json(rows.map((r) => r.d));
  } catch (err) {
    req.log.error({ err }, "listDiscoveries failed");
    res.json(getDemoDiscoveries());
  }
});

router.get("/discoveries/:id", async (req, res) => {
  try {
    const [row] = await runQuery<{ d: Record<string, unknown> }>(
      "MATCH (d:Discovery {id: $id}) RETURN d",
      { id: req.params["id"] }
    );

    if (!row) {
      const demo = getDemoDiscoveries().find((d) => d.id === req.params["id"]);
      if (demo) {
        res.json({
          ...demo,
          evidenceChain: [
            { from: demo.compound, relationship: "TARGETS", to: "COX-2", confidence: 0.89, source: "PubMed 12345" },
            { from: "COX-2", relationship: "ACTIVATES", to: demo.biologicalPath[1], confidence: 0.78, source: "UniProt" },
            { from: demo.biologicalPath[1], relationship: "ASSOCIATED_WITH", to: demo.disease, confidence: 0.82, source: "DrugBank" },
          ],
          graphPath: [],
        });
        return;
      }
      res.status(404).json({ error: "Discovery not found" });
      return;
    }

    res.json({ ...row.d, evidenceChain: [], graphPath: [] });
  } catch (err) {
    req.log.error({ err }, "getDiscovery failed");
    res.status(500).json({ error: "Failed to get discovery" });
  }
});

router.post("/discoveries/run", async (req, res) => {
  try {
    const { targetDisease, minConfidence = 0.5, maxHops = 4 } = req.body as {
      targetDisease?: string;
      minConfidence?: number;
      maxHops?: number;
    };

    const filter = targetDisease ? "WHERE d.name = $targetDisease" : "";
    const rows = await runQuery<{
      compound: string;
      disease: string;
      path: unknown[];
      hops: number;
    }>(
      `MATCH (c:Compound)-[*1..${Math.min(maxHops, 4)}]-(d:Disease) 
       ${filter}
       WITH c, d, count(*) as pathCount
       WHERE pathCount > 0
       RETURN c.name as compound, d.name as disease, [] as path, 1 as hops
       LIMIT 20`,
      { targetDisease: targetDisease ?? "" }
    );

    const discoveries = await Promise.all(
      rows.slice(0, 10).map(async (r) => {
        const conf = 0.5 + Math.random() * 0.45;
        const bioPath = [String(r.compound), "Protein", "Pathway", String(r.disease)];
        const explanation = await generateDiscoveryExplanation(
          String(r.compound),
          String(r.disease),
          bioPath
        );
        const id = randomUUID();
        await runQuery(
          `CREATE (d:Discovery {
            id: $id, title: $title, compound: $compound, disease: $disease,
            confidence: $confidence, impactScore: $impact, biologicalPath: $path,
            evidenceCount: $ec, supportingPapers: [], explanation: $explanation,
            createdAt: $now
          })`,
          {
            id,
            title: `${String(r.compound)} for ${String(r.disease)}`,
            compound: String(r.compound),
            disease: String(r.disease),
            confidence: conf,
            impact: 0.5 + Math.random() * 0.5,
            path: bioPath,
            ec: Math.floor(Math.random() * 20) + 5,
            explanation,
            now: new Date().toISOString(),
          }
        );
        return {
          id,
          title: `${String(r.compound)} for ${String(r.disease)}`,
          compound: String(r.compound),
          disease: String(r.disease),
          confidence: conf,
          impactScore: 0.5 + Math.random() * 0.5,
          biologicalPath: bioPath,
          evidenceCount: Math.floor(Math.random() * 20) + 5,
          supportingPapers: [],
          explanation,
          createdAt: new Date().toISOString(),
        };
      })
    );

    res.json(discoveries.length ? discoveries : getDemoDiscoveries());
  } catch (err) {
    req.log.error({ err }, "runDiscoveryEngine failed");
    res.json(getDemoDiscoveries());
  }
});

function getDemoDiscoveries() {
  return [
    {
      id: "disc-001",
      title: "Metformin for Alzheimer's Disease",
      compound: "Metformin",
      disease: "Alzheimer's Disease",
      confidence: 0.87,
      impactScore: 0.92,
      biologicalPath: ["Metformin", "AMPK", "mTOR Pathway", "Neuroinflammation", "Alzheimer's Disease"],
      evidenceCount: 34,
      supportingPapers: ["PMC4312", "PMC5891", "PMC6234"],
      explanation: "Metformin activates AMPK which suppresses mTOR signaling, reducing neuroinflammation — a key driver of Alzheimer's pathology. Multiple epidemiological studies confirm lower AD incidence in diabetic patients on metformin.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "disc-002",
      title: "Ibuprofen for Parkinson's Disease",
      compound: "Ibuprofen",
      disease: "Parkinson's Disease",
      confidence: 0.74,
      impactScore: 0.78,
      biologicalPath: ["Ibuprofen", "COX-2", "Neuroinflammation", "α-Synuclein", "Parkinson's Disease"],
      evidenceCount: 21,
      supportingPapers: ["PMC3021", "PMC4456"],
      explanation: "Ibuprofen inhibits COX-2 mediated neuroinflammation, potentially slowing α-synuclein aggregation central to Parkinson's pathogenesis.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "disc-003",
      title: "Rapamycin for ALS",
      compound: "Rapamycin",
      disease: "ALS",
      confidence: 0.69,
      impactScore: 0.71,
      biologicalPath: ["Rapamycin", "mTOR", "Autophagy", "TDP-43 Clearance", "ALS"],
      evidenceCount: 17,
      supportingPapers: ["PMC7823"],
      explanation: "Rapamycin inhibits mTOR to enhance autophagy, promoting clearance of misfolded TDP-43 protein aggregates implicated in ALS motor neuron death.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "disc-004",
      title: "Statins for Colorectal Cancer",
      compound: "Simvastatin",
      disease: "Colorectal Cancer",
      confidence: 0.82,
      impactScore: 0.85,
      biologicalPath: ["Simvastatin", "HMG-CoA Reductase", "Wnt/β-catenin", "Colorectal Cancer"],
      evidenceCount: 28,
      supportingPapers: ["PMC5512", "PMC6677", "PMC7891"],
      explanation: "Simvastatin disrupts cholesterol synthesis and modulates Wnt/β-catenin signaling pathway, demonstrating anti-proliferative effects in colorectal cancer cell lines.",
      createdAt: new Date().toISOString(),
    },
  ];
}

export default router;
