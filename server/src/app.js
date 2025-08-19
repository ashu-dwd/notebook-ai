import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import authRoute from "./routes/auth.route.js";
import uploadRoute from "./routes/upload.route.js";
import chatRoute from "./routes/chat.route.js";

export const app = express();

//endpoint logs
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(compression({ level: -1 }));
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//api endpoints
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/chat", chatRoute);
//app.use("/api/v1/user", userRoute);
app.use("/api/v1/upload", uploadRoute);
