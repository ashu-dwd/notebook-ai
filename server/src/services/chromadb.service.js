import { collection } from "../database/chroma.db.js";
import { v4 as uuid } from "uuid";

// sanitize metadata (only primitives allowed in Chroma)
function normalizeMetadata(meta) {
  if (meta == null) return null;

  if (typeof meta === "object") {
    // Convert object/array -> JSON string
    return JSON.stringify(meta);
  }

  if (["string", "number", "boolean"].includes(typeof meta)) {
    return meta;
  }

  return String(meta); // fallback
}

function normalizeEmbedding(emb) {
  if (emb == null) throw new TypeError("embedding is null/undefined");

  if (typeof emb === "object" && Array.isArray(emb.embedding)) {
    emb = emb.embedding;
  }
  if (
    Array.isArray(emb) &&
    emb.length &&
    typeof emb[0] === "object" &&
    Array.isArray(emb[0].embedding)
  ) {
    emb = emb[0].embedding;
  }
  if (ArrayBuffer.isView(emb)) {
    emb = Array.from(emb);
  }
  if (!Array.isArray(emb)) {
    throw new TypeError("embedding must be an array");
  }
  if (!emb.every((x) => typeof x === "number" && Number.isFinite(x))) {
    throw new TypeError("embedding contains non-numeric values");
  }
  return emb;
}

export const addVector = async ({
  id = uuid(),
  embedding,
  text,
  metadata = {},
}) => {
  const vec = normalizeEmbedding(embedding);

  // flatten metadata (make sure each key => primitive/stringified)
  const flatMetadata = {};
  for (const [key, value] of Object.entries(metadata)) {
    flatMetadata[key] = normalizeMetadata(value);
  }

  await collection.add({
    ids: [id],
    documents: [String(text ?? "")],
    metadatas: [flatMetadata],
    embeddings: [vec],
  });

  return { id };
};

export const searchVector = async (embedding, n_results = 2) => {
  console.log(typeof embedding);
  if (
    !Array.isArray(embedding) ||
    !embedding.every((x) => typeof x === "number")
  ) {
    throw new Error("Invalid embedding: must be an array of numbers");
  }

  const results = await collection.query({
    queryEmbeddings: [embedding], // array of embedding vectors
    n_results,
  });

  return results;
};
