import express from "express";
import { chatWithPdf } from "../controllers/chat.controller.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJwtToken, chatWithPdf);

export default router;
