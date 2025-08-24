import qdrantClient from "../database/qdrant.db.js";
import { getEmbeddings } from "./llm.service.js";

const collectionName = "notebook-ai";

const createCollection = async () => {
  try {
    await qdrantClient.getCollection(collectionName);
    // console.log(`ℹ️ Collection '${collectionName}' already exists.`);
  } catch (err) {
    if (err.status === 404) {
      await qdrantClient.createCollection(collectionName, {
        vectors: { size: 3072, distance: "Cosine" }, // match embedding dim
      });
      console.log(`✅ Collection '${collectionName}' created.`);
    } else {
      throw err;
    }
  }
};

const addDocument = async (document, metadata) => {
  await createCollection(); // ensure collection exists

  const embedding = await getEmbeddings(document);

  await qdrantClient.upsert(collectionName, {
    wait: true,
    points: [
      {
        id: metadata.id,
        vector: embedding,
        payload: { ...metadata, document },
      },
    ],
  });

  console.log(`✅ Document with id ${metadata.id} added.`);
};

const searchDocuments = async (query, limit = 5) => {
  await createCollection(); // ensure collection exists

  const queryEmbedding = await getEmbeddings(query);

  const searchResult = await qdrantClient.search(collectionName, {
    vector: queryEmbedding,
    limit,
    with_payload: true,
  });

  return searchResult.map((result) => result.payload);
};

const deleteDocument = async (id) => {
  await createCollection(); // ensure collection exists

  await qdrantClient.delete(collectionName, {
    pointsSelector: { points: [id] },
  });

  console.log(`🗑️ Document with id ${id} deleted from '${collectionName}'.`);
};

export { createCollection, addDocument, searchDocuments, deleteDocument };
