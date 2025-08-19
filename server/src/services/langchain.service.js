import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import second from '@langchain/'

export const chunkPdf = async (filePath) => {
  const loader = new PDFLoader(filePath);
  // page by page laoding pdf
  const docs = await loader.load();
  return docs;
};
