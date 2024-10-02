import { config } from "dotenv";
config();

import express from "express";
import morgan from "morgan";
import { z } from "zod";
import { validateRequestBody } from "zod-express-middleware";
import { consumer } from "./kafka";
import { OrderEventPayload } from "./types";
import { Product } from "./models";
import mongoose from "mongoose";
const app = express();
app.use(express.json());
app.use(morgan("common"));

app.post(
  "/",
  validateRequestBody(
    z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  async (req, res) => {
    try {
      const product = await Product.create(req.body);
      res.json({ result: product });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

app.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ result: products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json({ result: product });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const main = async () => {
  await mongoose.connect(process.env["MONGO_URI"]);
  await consumer.connect();
  await consumer.subscribe({ topic: "order-events" }).then(() => {
    "Consumer subscribed to order-events";
  });
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value.toString()) as OrderEventPayload;
      console.log(
        `[TOPIC]: [${topic}] | PART: ${partition} | EVENT: ${value.type}`
      );
      if (value.type === "order-placed") {
        for (const product of value.payload.products) {
          const existingProduct = await Product.findById(product._id);
          if (existingProduct) {
            existingProduct.quantity -= product.quantity;
            await existingProduct.save();
          }
        }
      }
    },
  });
};

main()
  .then(() => {
    app.listen(process.env["PRODUCTS_SERVICE_PORT"], () => {
      console.log(
        `Products service is running on port ${process.env["PRODUCTS_SERVICE_PORT"]}`
      );
    });
  })
  .catch(async (e) => {
    console.error(e);
    await consumer.disconnect();
    process.exit(1);
  });
