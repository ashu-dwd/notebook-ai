import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { addDocument, searchDocuments } from "./qdrant.service.js";
import { v4 as uuidv4 } from "uuid";

export const chunkPdf = async (filePath) => {
  const loader = new PDFLoader(filePath);
  // page by page laoding pdf
  const docs = await loader.load();
  return docs;
};

export const chunkWebsite = async (url) => {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  // Add IDs to chunks
  const chunksWithId = chunks.map((chunk, index) => ({
    ...chunk,
    id: uuidv4(), // or `${url}-${index}`
  }));

  //console.log("Website chunks:", chunksWithId);
  return chunksWithId;
};

export const addDocumentToVectorStore = async (chunks, userId, documentId) => {
  for (const chunk of chunks) {
    await addDocument(chunk.pageContent, {
      userId,
      documentId,
      loc: chunk.metadata.loc,
    });
  }
};

export const searchVectorStore = async (query, userId) => {
  const results = await searchDocuments(query, userId);
  return results;
};

export const chunkYoutube = async (url) => {
  const loader = YoutubeLoader.createFromUrl(url);
  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitDocuments(docs);
  return chunks;
};
