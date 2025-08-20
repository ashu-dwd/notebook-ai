import express from "express";
import {
  handlePdfUpload,
  getUploadedFiles,
  deleteUploadedFiles,
} from "../controllers/upload.controller.js";
import { upload } from "../services/multer.service.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJwtToken, upload.single("pdfFile"), handlePdfUpload);
router.get("/", verifyJwtToken, getUploadedFiles);
router.delete("/:fileId", verifyJwtToken, deleteUploadedFiles);

export default router;
