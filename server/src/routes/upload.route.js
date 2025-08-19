import express from "express";
import { handlePdfUpload } from "../controllers/upload.controller.js";
import { upload } from "../services/multer.service.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJwtToken, upload.single("pdfFile"), handlePdfUpload);

export default router;
