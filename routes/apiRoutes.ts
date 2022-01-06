import { Router } from "express";
import session from "express-session";
import { questions } from "../querstions";
import { User } from "../models/User";

declare module "express-session" {
  interface Session {
    name: string;
  }
}

const apiRouter = Router();

apiRouter.use(session({ secret: "secret" }));

apiRouter.post("/inregistrare", async (req, res) => {
  const { nume } = req.body;
  const newUser = new User({
    name: nume,
  });
  await newUser.save();
  req.session.name = nume;
  // update to mongo
  return res.status(200).send("1");
});

apiRouter.get("/intrebari", (req, res) => {
  const question = questions[Math.floor(Math.random() * questions.length)];
  return res.status(200).json(question);
});

apiRouter.post("/update", async (req, res) => {
  const { punctaj } = req.body;
  //console.log(req.session);
  const { name } = req.session;
  const user = await User.findOne({ name });
  if (punctaj) user.points = punctaj;
  await user.save();
  return res.status(200).send("1");
});

apiRouter.get("/clasament", async (req, res) => {
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

export { apiRouter };
