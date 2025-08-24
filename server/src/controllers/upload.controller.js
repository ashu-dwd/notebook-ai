import {
  chunkPdf,
  chunkWebsite,
  chunkYoutube,
} from "../services/langchain.service.js";
import { getEmbeddings } from "../services/llm.service.js";
import { v4 as uuidv4 } from "uuid";
import { addDocumentToVectorStore } from "../services/langchain.service.js";
import { addDocument, deleteDocument } from "../services/qdrant.service.js";
import { logger } from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";
import prisma from "../database/prisma.db.js";

const processAndStoreContent = async (userId, content, metadata) => {
  if (!userId) {
    throw new ApiError(400, "UserId is required for storing content", []);
  }

  const id = uuidv4();

  // Store in Qdrant
  await addDocument(content, {
    id,
    userId,
    text: content,
    ...metadata,
  });
  console.log("🧩 Vector inserted with ID:", id);

  // Create file record in DB
  const chatId = uuidv4();
  console.log("Attempting to create file record with userId:", userId); // Added logging
  await prisma.files.create({
    data: {
      userId,
      filePath: metadata.source,
      vectorId: id,
      chatId,
      type: metadata.type,
    },
  });
  console.log("File record created successfully for userId:", userId); // Added logging

  return id;
};

export const handlePdfUpload = async (req, res) => {
  console.log("📂 Uploaded File:", req.file);
  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
    select: { id: true },
  });
  console.log("User found:", user);
  if (user) {
    console.log("User ID retrieved:", user.id); // Added logging
  }
  try {
    if (!user) {
      throw new ApiError(404, "User not found", [req.user.email]);
    }
    const pages = await chunkPdf(req.file.path);

    // 3️⃣ Process each page
    const addResults = await Promise.all(
      pages.map(async (page) => {
        const vectorId = await processAndStoreContent(
          user.id,
          page.pageContent,
          { source: req.file.path, type: "pdf", ...page.metadata }
        );
        console.log("🧩 Vector inserted with ID:", vectorId);
        return vectorId;
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
    console.error("❌ Error in PDF upload handling:", error);
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
    //delete vectorIds from qdrant db
    await deleteDocument(file.vectorId);

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
    console.error("❌ Error in deleting uploaded files:", error);
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
  const { websiteUrl } = req.body;
  console.log("Uploading Website URL:", req.body);
  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found", [req.user.email]);
  }

  if (!websiteUrl) {
    throw new ApiError(400, "Website URL is required", []);
  }

  try {
    const chunks = await chunkWebsite(websiteUrl);
    const addResults = await Promise.all(
      chunks.map(async (chunk) => {
        console.log("Processing Website chunk:", chunk);

        const vectorId = await processAndStoreContent(
          user.id,
          chunk.pageContent,
          { source: websiteUrl, type: "website" }
        );
        console.log("Processing Website chunk, vectorId:", vectorId);
        return vectorId;
      })
    );
    return res.json({
      success: true,
      count: addResults.length,
      message: "Website content uploaded and processed successfully",
    });
  } catch (error) {
    console.error("❌ Error in website upload handling:", error);
    throw new ApiError(500, "Failed to process website upload", [
      error.message,
    ]);
  }
};

export const handleYoutubeUpload = async (req, res) => {
  const { url } = req.body;
  console.log("Uploading YouTube URL:", url);
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
          { source: url, type: "youtube", ...chunk.metadata }
        );
        console.log("Processing YouTube chunk, vectorId:", vectorId);
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
