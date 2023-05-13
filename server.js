import mongoose from "mongoose";
import chalk from "chalk";
import dotenv from "dotenv";
import app from "./index.js";

dotenv.config();

// New database connection
mongoose
  .connect(process.env.MONGODB_CON_URL, {
    serverSelectionTimeoutMS: 5000,
    useNewUrlParser: true,
  })
  .then(() => console.log(chalk.blueBright("Successfully connected to DB 🗃")))
  .catch((err) =>
    console.error(
      chalk.redBright(`Error while connecting to database.\n Err:: ${err}`)
    )
  );

//SERVER
const port = process.env.SERVER_PORT || 5000;
const server = app.listen(port, () =>
  console.log(chalk.hex("#FFA500").bold(`Listening on port ${port} 🚀`))
);

process.on("unhandledRejection", (err) => {
  console.log(chalk.bgRedBright("UNHANDLED REJECTION! 💥 Shutting down..."));
  console.error(`${err.name}=> ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
