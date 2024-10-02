import { config } from "dotenv";
config();
import express from "express";

import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./schema";

import { UserService } from "./services/users";
import { ProductService } from "./services/products";
import { OrderService } from "./services/orders";
import { consumer } from "./libs/kafka";
import { cacheClient } from "./libs/redis";

const root = {
  users: UserService.getAll,
  user: UserService.getById,
  registerUser: UserService.post,
  products: ProductService.getAll,
  product: ProductService.getById,
  createProduct: ProductService.post,
  orders: OrderService.getAll,
  order: OrderService.getById,
  placeOrder: OrderService.post,
};

const app = express();

app.all(
  "/graphql",
  createHandler({
    schema,
    rootValue: root,
    context: (req) => ({
      headers: req.headers,
    }),
  })
);

const main = async () => {
  await cacheClient.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "inventory-updates" });
  await consumer.run({
    eachMessage: async ({ topic, partition }) => {
      console.log(`[TOPIC]: [${topic}] | PART: ${partition}`);
      await cacheClient.del("products/");
    },
  });
  app.listen(4000);
  console.log("Running a GraphQL API server at http://localhost:4000/graphql");
};

main().catch(async (e) => {
  console.error(e);
  await consumer.disconnect();
  process.exit(1);
});
