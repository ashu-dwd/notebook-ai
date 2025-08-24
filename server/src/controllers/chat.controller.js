import { searchVector } from "../services/chromadb.service.js";
import { getEmbeddings, getTextResponse } from "../services/llm.service.js";
import ApiError from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

import prisma from "../database/prisma.db.js";

export const chatWithPdf = async (req, res) => {
  const { userMsg } = req.body;
  const user = await prisma.userData.findUnique({
    where: { email: req.user.email },
    select: { userId: true },
  });

  logger.info(userMsg);

  try {
    // Fetch chatId
    const files = await prisma.files.findMany({
      where: { userId: req.user.userId },
      select: { chatId: true },
    });

    if (!files || files.length === 0) {
      return res.json({
        success: false,
        message: "No files uploaded. Please upload files to start chatting.",
      });
    }

    const chatId = files[0].chatId;
    console.log("chatid", chatId);

    // Generate embedding
    const embeddings = await getEmbeddings(userMsg);
    console.log("embedding length", embeddings.length);

    // ✅ Flatten vectorIds
    const vectorRows = await prisma.files.findMany({
      where: { userId: req.user.userId },
      select: { vectorId: true },
    });
    const vectorIds = vectorRows.map((row) => row.vectorId);
    console.log("vectorIds", vectorIds);

    // Query Chroma
    const results = await searchVector(embeddings, req.user.userId);
    console.log("chroma results", results);

    // Get AI response
    const responseFromAI = await getTextResponse(userMsg, results);
    //saving into database
    await prisma.chats.create({
      data: {
        userId: user.userId,
        userMsg,
        aiResponse: responseFromAI,
      },
    });
    logger.info("Chat history saved successfully");

    return res.status(200).json({
      success: true,
      response: responseFromAI,
      message: "Chat processed successfully",
    });
  } catch (error) {
    console.log(error);
    logger.error("Error in chatWithPdf:", error.message);
    throw new ApiError("Failed to process chat request", 500);
  }
};

// export const handleUserChats = (req,res)={}
