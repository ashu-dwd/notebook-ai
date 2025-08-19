import { chunkPdf } from "../services/langchain.service.js";
import { getEmbeddings } from "../services/llm.service.js";
import { v4 as uuidv4 } from "uuid";
import { addVector } from "../services/chromadb.service.js";
import { logger } from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";
import { db, runQuery } from "../database/sqlLite.db.js";

export const handlePdfUpload = async (req, res) => {
  //console.log("📂 Uploaded File:", req.file);
  const user = runQuery("SELECT userId FROM userData WHERE email = ? LIMIT 1", [
    req.user.email,
  ]);
  console.log("User found:", user);
  try {
    logger.info("Uploaded file:", req.file);

    // 1️⃣ Get userId from email

    if (!user) {
      throw new ApiError(404, "User not found", [req.user.email]);
    }

    // 2️⃣ Chunk the PDF into pages
    const pages = await chunkPdf(req.file.path);

    // 3️⃣ Process each page
    const addResults = await Promise.all(
      pages.map(async (page) => {
        // Generate embedding
        const embedding = await getEmbeddings(page.pageContent);

        // Create unique vector ID
        const id = uuidv4();

        // Add vector to ChromaDB (or whichever DB)
        const vectorResult = await addVector({
          id,
          embedding,
          text: page.pageContent,
          metadata: page.metadata,
        });

        console.log("🧩 Vector inserted with ID:", vectorResult.id);
        // console.log(typeof vectorResult.id);
        // console.log(typeof user.userId);
        // console.log(typeof req.file.path);

        runQuery(
          `
    INSERT INTO files (userId, filePath, vectorId)
    VALUES (?, ?, ?)
  `,
          [user.userId, req.file.path, vectorResult.id]
        );

        // console.log("✅ File inserted with ID:", fileInsert.lastInsertRowid);
        return vectorResult.id;
      })
    );

    // 4️⃣ Response
    logger.info(`Added ${addResults.length} page vectors successfully.`);
    return res.json({
      success: true,
      count: addResults.length,
      message: "PDF uploaded and processed successfully",
    });
  } catch (error) {
    logger.error("❌ Error in PDF upload handling:", error);
    throw new ApiError(500, "Failed to process PDF upload", [error.message]);
  }
};
