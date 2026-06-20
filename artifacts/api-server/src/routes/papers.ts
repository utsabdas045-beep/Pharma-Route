import { Router } from "express";
import { randomUUID } from "crypto";
import { runQuery } from "../lib/neo4j";
import { extractBiomedicalEntities } from "../lib/sarvam";

const router = Router();

router.get("/papers", async (req, res) => {
  try {
    const rows = await runQuery<{ p: Record<string, unknown> }>(`
      MATCH (p:Paper) RETURN p ORDER BY p.createdAt DESC LIMIT 100
    `);
    const papers = rows.map((r) => r.p);
    res.json(papers);
  } catch (err) {
    req.log.error({ err }, "listPapers failed");
    res.status(500).json({ error: "Failed to list papers" });
  }
});

router.post("/papers", async (req, res) => {
  try {
    const { title, abstract, authors = [], content, sourceUrl } = req.body as {
      title: string;
      abstract?: string;
      authors?: string[];
      content: string;
      sourceUrl?: string;
    };

    const id = randomUUID();
    const now = new Date().toISOString();

    await runQuery(
      `CREATE (p:Paper {
        id: $id, paperId: $id, title: $title,
        abstract: $abstract, authors: $authors,
        status: 'processing', entitiesExtracted: 0,
        relationshipsExtracted: 0, createdAt: $createdAt,
        processedAt: null, sourceUrl: $sourceUrl
      })`,
      { id, title, abstract: abstract ?? "", authors, createdAt: now, sourceUrl: sourceUrl ?? "" }
    );

    // Process async
    setImmediate(() => processPaper(id, title, abstract ?? "", content));

    const [row] = await runQuery<{ p: Record<string, unknown> }>(
      "MATCH (p:Paper {id: $id}) RETURN p",
      { id }
    );
    res.status(201).json(row?.p ?? { id, title, status: "processing", createdAt: now });
  } catch (err) {
    req.log.error({ err }, "uploadPaper failed");
    res.status(500).json({ error: "Failed to upload paper" });
  }
});

router.get("/papers/:id", async (req, res) => {
  try {
    const [row] = await runQuery<{ p: Record<string, unknown> }>(
      "MATCH (p:Paper {id: $id}) RETURN p",
      { id: req.params["id"] }
    );
    if (!row) { res.status(404).json({ error: "Paper not found" }); return; }
    res.json(row.p);
  } catch (err) {
    req.log.error({ err }, "getPaper failed");
    res.status(500).json({ error: "Failed to get paper" });
  }
});

router.get("/papers/:id/status", async (req, res) => {
  try {
    const [row] = await runQuery<{ p: Record<string, unknown> }>(
      "MATCH (p:Paper {id: $id}) RETURN p",
      { id: req.params["id"] }
    );
    if (!row) { res.status(404).json({ error: "Paper not found" }); return; }
    const p = row.p;
    res.json({
      id: p["id"],
      status: p["status"],
      progress: p["status"] === "completed" ? 100 : p["status"] === "failed" ? 0 : 50,
      currentStep: p["status"] === "processing" ? "Extracting entities" : String(p["status"]),
      entitiesFound: p["entitiesExtracted"] ?? 0,
      relationshipsFound: p["relationshipsExtracted"] ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "getPaperStatus failed");
    res.status(500).json({ error: "Failed to get status" });
  }
});

async function processPaper(id: string, title: string, abstract: string, content: string) {
  try {
    const text = `${title}\n${abstract}\n${content}`;
    const { entities, relationships } = await extractBiomedicalEntities(text);

    for (const entity of entities) {
      await runQuery(
        `MERGE (n:${entity.type} {name: $name}) SET n.aliases = $aliases`,
        { name: entity.name, aliases: entity.aliases ?? [] }
      );
    }

    for (const rel of relationships) {
      await runQuery(
        `MERGE (a:${rel.fromType} {name: $from})
         MERGE (b:${rel.toType} {name: $to})
         MERGE (a)-[r:${rel.relationship}]->(b)
         SET r.confidence = $confidence, r.source = $paperId`,
        { from: rel.from, to: rel.to, confidence: rel.confidence, paperId: id }
      );
    }

    await runQuery(
      `MATCH (p:Paper {id: $id})
       SET p.status = 'completed', p.entitiesExtracted = $entities,
           p.relationshipsExtracted = $rels, p.processedAt = $now`,
      {
        id,
        entities: entities.length,
        rels: relationships.length,
        now: new Date().toISOString(),
      }
    );
  } catch {
    await runQuery(
      "MATCH (p:Paper {id: $id}) SET p.status = 'failed'",
      { id }
    );
  }
}

export default router;
