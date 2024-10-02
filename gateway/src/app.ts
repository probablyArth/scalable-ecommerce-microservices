import express from "express";

import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./schema";
import { UserService } from "./services/users";
import { ProductService } from "./services/products";
import { OrderService } from "./services/orders";

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

export default app;
