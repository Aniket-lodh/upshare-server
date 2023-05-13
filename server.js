import mongoose from "mongoose";
import chalk from "chalk";
import dotenv from "dotenv";
import app  from "./index.js";

dotenv.config();

// New database connection
const URI = process.env.MONGODB_CON_URL.replace(
  "<PASSWORD>",
  process.env.ATLAS_UPSHARE_PASS
);
// mongoose
//   .connect(URI, {
//     serverSelectionTimeoutMS: 5000,
//     useNewUrlParser: true,
//   })
//   .then(() => console.log(chalk.blueBright("Successfully connected to DB 🗃")))
//   .catch((err) =>
//     console.error(
//       chalk.redBright(`Error while connecting to database.\n Err:: ${err}`)
//     )
//   );

const connectDB = async () => {
  try {
    mongoose
      .connect(URI)
      .then((conn) =>
        console.log(
          chalk.blueBright("Successfully connected to DB 🗃"),
          conn.connection.host
        )
      );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

//SERVER
const port = process.env.SERVER_PORT || 5000;
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
