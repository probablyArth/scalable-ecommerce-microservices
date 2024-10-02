import express from "express";
import morgan from "morgan";
import { z } from "zod";
import { validateRequestBody } from "zod-express-middleware";
import { Product } from "./models";
import { producer } from "./kafka";
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
      await producer.send({
        topic: "inventory-events",
        messages: [
          {
            value: JSON.stringify({
              type: "product-created",
              payload: product,
            }),
          },
        ],
      });
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

export default app;
