import express from "express";
import {
  handleUserLogin,
  handleUserSignUp,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", handleUserSignUp);
router.post("/login", handleUserLogin);

export default router;
