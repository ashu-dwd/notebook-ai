import OpenAI from "openai";
import {
  GEMINI_API_KEY,
  GEMINI_EMBEDDINGS_MODEL,
} from "../../config/contants.js";

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const getEmbeddings = async (text) => {
  const embedding = await openai.embeddings.create({
    model: GEMINI_EMBEDDINGS_MODEL,
    input: text,
    encoding_format: "float",
  });
  console.log("in llm.service.js", embedding.data[0].embedding.length);
  return embedding.data[0].embedding;
};

export const getTextResponse = async (userMsg, vectorData) => {
  const response = await openai.chat.completions.create({
    model: "gemini-2.5-pro",
    messages: [
      {
        role: "system",
        content: `Based on user query you have to provide user a structured and formatted response from provide a pdf chunked data. you have to provide user page source and important data related to user query.Here is pdf vectorData: ${JSON.stringify(
          vectorData
        )}`,
      },
      {
        role: "user",
        content: userMsg,
      },
    ],
  });
  return response.choices[0].message.content;
};

await getEmbeddings("Sample text for embedding");
