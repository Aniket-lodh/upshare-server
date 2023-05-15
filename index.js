import mongoose from "mongoose";
import chalk from "chalk";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: "./config.env" });

const connectDB = async () => {
  // New database connection
  const URI = process.env.MONGODB_CON_URL.replace(
    "<PASSWORD>",
    process.env.ATLAS_UPSHARE_PASS
  );
  try {
    mongoose.set("strictQuery", false);
    mongoose
      .connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((conn) =>
        console.log(
          chalk.blueBright("Successfully connected to DB 🗃"),
          conn.connection.host
        )
      );
  } catch (err) {
    console.error(
      chalk.redBright(`Error while connecting to database.\n Err:: ${err}`)
    );
    process.exit(1);
  }
};

//SERVER
const port = process.env.PORT || 2408;
var server;

connectDB().then(
  () =>
    (server = app.listen(port, () =>
      console.log(chalk.hex("#FFA500").bold(`Listening on port ${port} 🚀`))
    ))
);

process.on("unhandledRejection", (err) => {
  console.log(chalk.bgRedBright("UNHANDLED REJECTION! 💥 Shutting down..."));
  console.error(`${err.name}=> ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
