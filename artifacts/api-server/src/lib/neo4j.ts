import neo4j, { Driver, Session, Integer, Node, Relationship, isInt, isNode, isRelationship } from "neo4j-driver";
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

// Deep-convert Neo4j native types to plain JS values
function serialize(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  // Neo4j Integer → JS number
  if (isInt(value as Integer)) {
    return (value as Integer).toNumber();
  }

  // Neo4j Node → plain properties object
  if (isNode(value as Node)) {
    const node = value as Node;
    return serialize(node.properties);
  }

  // Neo4j Relationship → plain properties object
  if (isRelationship(value as Relationship)) {
    const rel = value as Relationship;
    return serialize(rel.properties);
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  // Plain object
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serialize(v);
    }
    return out;
  }

  return value;
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
    return result.records.map((r) => serialize(r.toObject()) as T);
  } finally {
    await session.close();
  }
}

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
