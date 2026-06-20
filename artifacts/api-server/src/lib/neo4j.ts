import neo4j, { Driver, Session, Integer } from "neo4j-driver";
import { logger } from "./logger";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env["NEO4J_URI"];
    const username = process.env["NEO4J_USERNAME"];
    const password = process.env["NEO4J_PASSWORD"];
    if (!uri || !username || !password) {
      throw new Error("NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD required");
    }
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    logger.info("Neo4j driver initialized");
  }
  return driver;
}

function toNeo4jParams(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "number" && Number.isInteger(v)) {
      out[k] = neo4j.int(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session: Session = getDriver().session();
  try {
    const result = await session.run(cypher, toNeo4jParams(params));
    return result.records.map((r) => r.toObject() as T);
  } finally {
    await session.close();
  }
}

// Re-export Integer type for use in routes
export type { Integer };

export async function initConstraints(): Promise<void> {
  const session = getDriver().session();
  try {
    const constraints = [
      "CREATE CONSTRAINT compound_name IF NOT EXISTS FOR (c:Compound) REQUIRE c.name IS UNIQUE",
      "CREATE CONSTRAINT protein_name IF NOT EXISTS FOR (p:Protein) REQUIRE p.name IS UNIQUE",
      "CREATE CONSTRAINT gene_name IF NOT EXISTS FOR (g:Gene) REQUIRE g.name IS UNIQUE",
      "CREATE CONSTRAINT disease_name IF NOT EXISTS FOR (d:Disease) REQUIRE d.name IS UNIQUE",
      "CREATE CONSTRAINT pathway_name IF NOT EXISTS FOR (p:Pathway) REQUIRE p.name IS UNIQUE",
      "CREATE CONSTRAINT paper_id IF NOT EXISTS FOR (p:Paper) REQUIRE p.paperId IS UNIQUE",
    ];
    for (const c of constraints) {
      await session.run(c);
    }
    logger.info("Neo4j constraints initialized");
  } catch (err) {
    logger.warn({ err }, "Failed to create some constraints (may already exist)");
  } finally {
    await session.close();
  }
}
