import express from "express";
import { getChatHistory } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get("/chatHistory", getChatHistory);

export default router;
