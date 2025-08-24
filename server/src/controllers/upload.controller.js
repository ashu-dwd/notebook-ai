import {
  chunkPdf,
  chunkWebsite,
  chunkYoutube,
} from "../services/langchain.service.js";
import { getEmbeddings } from "../services/llm.service.js";
import { v4 as uuidv4 } from "uuid";
import { addVector, deleteVector } from "../services/chromadb.service.js";
import { logger } from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";
import prisma from "../database/prisma.db.js";

const processAndStoreContent = async (userId, content, metadata) => {
  const embedding = await getEmbeddings(content);
  const id = uuidv4();
  const vectorResult = await addVector({
    id,
    embedding,
    userId,
    text: content,
    metadata,
  });

  logger.info("🧩 Vector inserted with ID:", vectorResult.id);

  const chatId = uuidv4();
  await prisma.files.create({
    data: {
      userId,
      filePath: metadata.source,
      vectorId: vectorResult.id,
      chatId,
      type: metadata.type,
    },
  });
  return vectorResult.id;
};

export const handlePdfUpload = async (req, res) => {
  //console.log("📂 Uploaded File:", req.file);
  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
    select: { id: true },
  });
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
          userId: user.id,
          text: page.pageContent,
          metadata: page.metadata,
        });

        console.log("🧩 Vector inserted with ID:", vectorResult.id);

        const chatId = uuidv4();
        await prisma.files.create({
          data: {
            userId: user.id,
            filePath: req.file.path,
            vectorId: vectorResult.id,
            chatId,
          },
        });

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
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: { id: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found", [req.user.email]);
    }

    const files = await prisma.files.findMany({
      where: { userId: user.id },
      select: { fileId: true, filePath: true },
    });

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
    const file = await prisma.files.findFirst({
      where: { fileId, userId },
    });
    if (!file) {
      throw new ApiError(404, "File not found", [fileId]);
    }
    //delete vectorIds from chroma db
    console.log(file);

    await deleteVector(file.vectorId);

    // Delete file from database
    await prisma.files.delete({
      where: { fileId },
    });

    return res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    logger.error("❌ Error in deleting uploaded files:", error);
    throw new ApiError(500, "Failed to delete uploaded files", [error.message]);
  }
};

export const handleTextUpload = async (req, res) => {
  const { text } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found", [req.user.email]);
  }

  if (!text) {
    throw new ApiError(400, "Text is required", []);
  }

  try {
    const metadata = {
      source: "text-upload",
      type: "text",
    };
    const vectorId = await processAndStoreContent(user.id, text, metadata);
    return res.json({
      success: true,
      message: "Text uploaded and processed successfully",
      vectorId,
    });
  } catch (error) {
    logger.error("❌ Error in text upload handling:", error);
    throw new ApiError(500, "Failed to process text upload", [error.message]);
  }
};

export const handleWebsiteUpload = async (req, res) => {
  const { url } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found", [req.user.email]);
  }

  if (!url) {
    throw new ApiError(400, "URL is required", []);
  }

  try {
    const chunks = await chunkWebsite(url);
    const addResults = await Promise.all(
      chunks.map(async (chunk) => {
        const vectorId = await processAndStoreContent(
          user.id,
          chunk.pageContent,
          { source: url, type: "website" }
        );
        return vectorId;
      })
    );
    return res.json({
      success: true,
      count: addResults.length,
      message: "Website content uploaded and processed successfully",
    });
  } catch (error) {
    logger.error("❌ Error in website upload handling:", error);
    throw new ApiError(500, "Failed to process website upload", [
      error.message,
    ]);
  }
};

export const handleYoutubeUpload = async (req, res) => {
  const { url } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found", [req.user.email]);
  }

  if (!url) {
    throw new ApiError(400, "URL is required", []);
  }

  try {
    const chunks = await chunkYoutube(url);
    const addResults = await Promise.all(
      chunks.map(async (chunk) => {
        const vectorId = await processAndStoreContent(
          user.id,
          chunk.pageContent,
          { source: url, type: "youtube" }
        );
        return vectorId;
      })
    );
    return res.json({
      success: true,
      count: addResults.length,
      message: "YouTube transcript uploaded and processed successfully",
    });
  } catch (error) {
    logger.error("❌ Error in YouTube upload handling:", error);
    throw new ApiError(500, "Failed to process YouTube upload", [
      error.message,
    ]);
  }
};
