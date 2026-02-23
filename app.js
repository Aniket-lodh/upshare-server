import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";
import usersRouter from "./routes/userRoutes.js";
import GlobalErrorHandler from "./handler/globalErrorHandler.js";
import ServeError from "./utils/ServeError.js";

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// CORS
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5000", "https://up-share.vercel.app"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing (replaces deprecated body-parser)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files, cookies, compression
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  compression({
    threshold: 0,
  })
);

// Root
app.get("/", (req, res, next) => {
  res.status(200).send({
    message: "You have encountered Upshare Backend Server.",
  });
});

import postRouter from "./routes/postRoutes.js";

// ROUTES
app.use("/users", usersRouter);
app.use("/posts", postRouter);

// Global 404 handler
app.all("*", (req, res, next) => {
  next(new ServeError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler (must be last)
app.use(GlobalErrorHandler);

export default app;
