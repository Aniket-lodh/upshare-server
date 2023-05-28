import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import usersRouter from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import GlobalErrorHandler from "./handler/globalErrorHandler.js";
import bodyParser from "body-parser";

const app = express();

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5000", "https://up-share.vercel.app"],
  optionSuccessStatus: 200,
};

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  compression({
    threshold: 0, // Compresses all responses regardless of their size
  })
);

app.get("/", (req, res, next) => {
  res.status(200).send({
    message: "You have encountered Upshare Backend Server.",
  });
});

// ROUTES
app.use("/users", usersRouter);
app.use("/vehicles", vehicleRoutes);

app.use(GlobalErrorHandler);
export default app;
