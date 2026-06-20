import { Router } from "express";
import { randomUUID } from "crypto";
import { runQuery } from "../lib/neo4j";

const router = Router();

const reportStore: Record<string, unknown>[] = [];

router.get("/reports", async (req, res) => {
  try {
    const rows = await runQuery<{ r: Record<string, unknown> }>(
      "MATCH (r:Report) RETURN r ORDER BY r.createdAt DESC LIMIT 50"
    );
    if (rows.length) {
      res.json(rows.map((r) => r.r));
    } else {
      res.json(reportStore);
    }
  } catch {
    res.json(reportStore);
  }
});

router.post("/reports", async (req, res) => {
  try {
    const { title, type, targetDisease } = req.body as {
      title: string;
      type: string;
      targetDisease?: string;
    };

    const statsRows = await runQuery<{ count: number }>(
      "MATCH (n:Discovery) RETURN count(n) as count"
    ).catch(() => [{ count: 0 }]);

    const discCount = Number(statsRows[0]?.count ?? 0);

    const report = {
      id: randomUUID(),
      title,
      type,
      summary: `Research intelligence report: ${title}. Analyzed ${discCount} discoveries${targetDisease ? ` related to ${targetDisease}` : ""}. Generated on ${new Date().toLocaleDateString()}.`,
      discoveries: [],
      trends: [],
      graphStats: null,
      createdAt: new Date().toISOString(),
    };

    reportStore.unshift(report);

    await runQuery(
      `CREATE (r:Report {id: $id, title: $title, type: $type, summary: $summary, createdAt: $createdAt})`,
      { id: report.id, title, type, summary: report.summary, createdAt: report.createdAt }
    ).catch(() => {});

    res.status(201).json(report);
  } catch (err) {
    req.log.error({ err }, "generateReport failed");
    res.status(500).json({ error: "Failed to generate report" });
  }
});

router.get("/reports/:id", async (req, res) => {
  try {
    const [row] = await runQuery<{ r: Record<string, unknown> }>(
      "MATCH (r:Report {id: $id}) RETURN r",
      { id: req.params["id"] }
    );
    if (row) { res.json(row.r); return; }

    const local = reportStore.find((r) => (r as { id: string }).id === req.params["id"]);
    if (local) { res.json(local); return; }

    res.status(404).json({ error: "Report not found" });
  } catch (err) {
    req.log.error({ err }, "getReport failed");
    res.status(500).json({ error: "Failed to get report" });
  }
});

export default router;
