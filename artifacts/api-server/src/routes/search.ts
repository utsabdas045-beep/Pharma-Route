import { Router } from "express";
import { runQuery } from "../lib/neo4j";
import { processNaturalLanguageQuery, generateDiscoveryExplanation } from "../lib/sarvam";

const router = Router();

router.post("/search", async (req, res) => {
  try {
    const { query, nodeTypes, limit = 10 } = req.body as {
      query: string;
      nodeTypes?: string[];
      limit?: number;
    };

    const parsed = await processNaturalLanguageQuery(query);
    const searchTerms = parsed.searchTerms.length ? parsed.searchTerms : [query];
    const term = searchTerms[0];

    const nodeRows = await runQuery<{ n: Record<string, unknown>; type: string; connections: number }>(
      `MATCH (n) WHERE (n:Compound OR n:Protein OR n:Gene OR n:Disease OR n:Pathway)
       AND toLower(n.name) CONTAINS toLower($term)
       OPTIONAL MATCH (n)-[r]-()
       RETURN n, labels(n)[0] as type, count(r) as connections
       LIMIT $limit`,
      { term, limit }
    );

    const nodes = nodeRows.map((r) => ({
      id: String(r.n["name"] ?? ""),
      name: String(r.n["name"] ?? ""),
      type: r.type,
      properties: r.n,
      connections: Number(r.connections ?? 0),
    }));

    const discRows = await runQuery<{ d: Record<string, unknown> }>(
      `MATCH (d:Discovery) WHERE toLower(d.compound) CONTAINS toLower($term)
       OR toLower(d.disease) CONTAINS toLower($term)
       RETURN d LIMIT $limit`,
      { term, limit }
    );

    const explanation = await generateDiscoveryExplanation(term, "related diseases", [term]);

    res.json({
      query,
      nodes,
      discoveries: discRows.map((r) => r.d),
      explanation: `Found ${nodes.length} nodes and ${discRows.length} discoveries related to "${query}". ${explanation}`,
      paths: [],
    });
  } catch (err) {
    req.log.error({ err }, "search failed");
    res.status(500).json({ error: "Search failed" });
  }
});

router.post("/search/voice", async (req, res) => {
  try {
    const { transcript } = req.body as { transcript: string };
    req.body = { query: transcript, limit: 10 };
    const parsed = await processNaturalLanguageQuery(transcript);

    const rows = await runQuery<{ n: Record<string, unknown>; type: string; connections: number }>(
      `MATCH (n) WHERE (n:Compound OR n:Protein OR n:Gene OR n:Disease OR n:Pathway)
       AND any(term IN $terms WHERE toLower(n.name) CONTAINS toLower(term))
       OPTIONAL MATCH (n)-[r]-()
       RETURN n, labels(n)[0] as type, count(r) as connections LIMIT 10`,
      { terms: parsed.searchTerms.length ? parsed.searchTerms : [transcript] }
    );

    const nodes = rows.map((r) => ({
      id: String(r.n["name"] ?? ""),
      name: String(r.n["name"] ?? ""),
      type: r.type,
      properties: r.n,
      connections: Number(r.connections ?? 0),
    }));

    res.json({
      query: transcript,
      nodes,
      discoveries: [],
      explanation: `Voice query processed: "${transcript}". Found ${nodes.length} relevant nodes. ${parsed.intent}`,
      paths: [],
    });
  } catch (err) {
    req.log.error({ err }, "voiceSearch failed");
    res.status(500).json({ error: "Voice search failed" });
  }
});

export default router;
