import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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
  return chunks;
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
