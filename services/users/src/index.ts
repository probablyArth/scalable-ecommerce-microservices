import { config } from "dotenv";
config();

import express from "express";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { validateRequestBody } from "zod-express-middleware";
import { User } from "./models";
import mongoose from "mongoose";
import { signJwt } from "./jwt";
const app = express();
app.use(express.json());
app.use(morgan("common"));

app.post(
  "/",
  validateRequestBody(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  ),
  async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }
      console.log("Hashing password");
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        try {
          const newUser = await User.create({ username, password: hash });
          const token = signJwt(newUser.id);
          res.json({ result: { user: newUser, access_token: token } });
        } catch (e) {
          res.status(500).json({ error: e.message });
          return;
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

app.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ result: user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ result: users });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const main = async () => {
  await mongoose.connect(process.env["MONGO_URI"]);
};

main()
  .then(() => {
    app.listen(process.env["USERS_SERVICE_PORT"], () => {
      console.log(
        `Users service is running on port ${process.env["USERS_SERVICE_PORT"]}`
      );
    });
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
