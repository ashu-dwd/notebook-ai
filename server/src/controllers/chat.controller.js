import { success } from "zod";
import { searchVector } from "../services/chromadb.service.js";
import { getEmbeddings, getTextResponse } from "../services/llm.service.js";
import ApiError from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const chatWithPdf = async (req, res) => {
  const { userMsg, chatId } = req.body;
  logger.info(userMsg);
  try {
    const embeddings = await getEmbeddings(userMsg);
    //console.log(embeddings.length);
    const results = await searchVector(embeddings);
    //console.log(results);
    const responseFromAI = await getTextResponse(userMsg, results);
    return res.json({
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
