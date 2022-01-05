import express from "express";
import session from "express-session";
import path from "path";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import { questions } from "./querstions";
import { User } from "./models/User";
config();

declare module "express-session" {
  interface Session {
    name: string;
  }
}

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
app.use(session({ secret: "secret" }));
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));
app.post("/inregistrare", async (req, res) => {
  const { nume } = req.body;
  const newUser = new User({
    name: nume,
  });
  await newUser.save();
  req.session.name = nume;
  // update to mongo
  return res.status(200).send("1");
});

app.get("/intrebari", (req, res) => {
  const question = questions[Math.floor(Math.random() * questions.length)];
  return res.status(200).json(question);
});

app.post("/update", async (req, res) => {
  const { punctaj } = req.body;
  //console.log(req.session);
  const { name } = req.session;
  const user = await User.findOne({ name });
  if (punctaj) user.points = punctaj;
  await user.save();
  return res.status(200).send("1");
});

app.get("/clasament", async (req, res) => {
  const users = await User.find({}).sort({ points: -1 });
  let output: string = "";

  if (users.length === 0)
    output += `<div class="item">Momentan nu exista niciun clasament!</div>`;
  else {
    users.forEach((user) => {
      let html: string = ``;
      if (req.session.name === user.name) {
        html = `<div class="nume" style="color:green">${user.name}</div>
            <div class="punctaj" style="color:green">${user.points} puncte</div>`;
      } else {
        html = `<div class="nume">${user.name}</div>
            <div class="punctaj">${user.points} puncte</div>`;
      }
      output += `<div class="item">${html}</div>`;
    });
  }
  res.send(output);
});
app.listen(PORT, () => console.log(`server runs on port ${PORT}`));
