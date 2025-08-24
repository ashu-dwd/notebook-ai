import { QdrantClient } from "@qdrant/qdrant-js";

const qdrantClient = new QdrantClient({
  host: process.env.QDRANT_HOST || "localhost",
  port: parseInt(process.env.QDRANT_PORT || "6333", 10),
});

export default qdrantClient;
