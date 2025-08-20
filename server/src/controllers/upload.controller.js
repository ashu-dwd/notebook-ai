import { chunkPdf } from "../services/langchain.service.js";
import { getEmbeddings } from "../services/llm.service.js";
import { v4 as uuidv4 } from "uuid";
import { addVector, deleteVector } from "../services/chromadb.service.js";
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
    if (!user) {
      throw new ApiError(404, "User not found", [req.user.email]);
    }
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
          userId: req.user.userId,
          text: page.pageContent,
          metadata: page.metadata,
        });

        console.log("🧩 Vector inserted with ID:", vectorResult.id);

        const chatId = uuidv4();
        await runQuery(
          `
    INSERT INTO files (userId, filePath, vectorId, chatId)
    VALUES (?, ?, ?, ?)
  `,
          [user.userId, req.file.path, vectorResult.id, chatId]
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

export const getUploadedFiles = async (req, res) => {
  try {
    const user = await runQuery(
      "SELECT userId FROM userData WHERE email = ? LIMIT 1",
      [req.user.email]
    );

    if (!user) {
      throw new ApiError(404, "User not found", [req.user.email]);
    }

    const files = await runQuery(
      "SELECT fileId, filePath FROM files WHERE userId = ?",
      [user.userId]
    );

    return res.json({
      success: true,
      files: files,
      message: "Files fetched successfully",
    });
  } catch (error) {
    logger.error("❌ Error in fetching uploaded files:", error);
    throw new ApiError(500, "Failed to fetch uploaded files", [error.message]);
  }
};

export const deleteUploadedFiles = async (req, res) => {
  const userId = req.user.userId;
  const fileId = req.params.fileId;

  try {
    // Check if file exists
    const file = await runQuery(
      "SELECT * FROM files WHERE fileId = ? AND userId = ?",
      [fileId, userId]
    );
    if (!file) {
      throw new ApiError(404, "File not found", [fileId]);
    }
    //delete vectorIds from chroma db
    console.log(file);

    await deleteVector(file[0].vectorId);

    // Delete file from database
    await runQuery("DELETE FROM files WHERE fileId = ?", [fileId]);

    return res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    logger.error("❌ Error in deleting uploaded files:", error);
    throw new ApiError(500, "Failed to delete uploaded files", [error.message]);
  }
};
