import { config } from "dotenv";
config();
import express from "express";
import { Order } from "./models";
import { validateRequestBody } from "zod-express-middleware";
import { z } from "zod";
import axios from "axios";
import { consumer, producer } from "./kafka";
import mongoose from "mongoose";
import morgan from "morgan";

const app = express();
app.use(express.json());
app.use(morgan("common"));

app.get("/", async (req, res) => {
  try {
    res.json({ result: await Order.find({}) });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({ result: order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post(
  "/",
  validateRequestBody(
    z.object({
      products: z.array(z.object({ _id: z.string(), quantity: z.number() })),
    })
  ),
  async (req, res) => {
    try {
      const userId = req.headers["x-user-id"];

      if (!userId) {
        res.status(401).send("Unauthorized");
        return;
      }
      try {
        await axios.get(`${process.env.USERS_SERVICE_URL}/${userId}`);
      } catch (e) {
        console.log(e);
        res.status(401).send("Unauthorized");
        return;
      }
      for (const { _id, quantity } of req.body.products) {
        try {
          const product = (
            await axios.get(`${process.env.PRODUCTS_SERVICE_URL}/${_id}`)
          ).data as { result: { _id: string; quantity: number } };
          if (product.result.quantity < quantity) {
            res.status(400).send("Insufficient product quantity");
            return;
          }
        } catch (e) {
          res.status(400).send(`Product ${_id} not found`);
          return;
        }
      }
      const order = await Order.create({ products: req.body.products, userId });
      console.log({ order });
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ type: "order-placed", payload: order }) },
        ],
      });
      res.status(201).json({ result: order });
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

const main = async () => {
  await mongoose.connect(process.env["MONGO_URI"]);
  await producer.connect();
};
main()
  .then(() => {
    app.listen(process.env["ORDERS_SERVICE_PORT"], () => {
      console.log(
        `Orders service is running on port ${process.env["ORDERS_SERVICE_PORT"]}`
      );
    });
  })
  .catch(async (e) => {
    console.error(e);
    await producer.disconnect();
    await consumer.disconnect();
    process.exit(1);
  });
