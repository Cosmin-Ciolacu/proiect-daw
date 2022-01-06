import express from "express";
import path from "path";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import { apiRouter } from "./routes/apiRoutes";
import { questions } from "./querstions";
import { User } from "./models/User";
config();

const uri =
  "mongodb+srv://cosmin:cosmin@cluster0.qklhm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, (err) => {
  if (err) console.log(err);
  console.log("connected to mongo");
});

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));
app.use("/api", apiRouter);

app.listen(PORT, () => console.log(`server runs on port ${PORT}`));
