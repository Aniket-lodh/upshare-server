import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import usersRouter from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import GlobalErrorHandler from "./handler/globalErrorHandler.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
