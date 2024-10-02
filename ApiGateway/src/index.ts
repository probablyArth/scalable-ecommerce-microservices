import { config } from "dotenv";
config();

import express from "express";
import { verify } from "jsonwebtoken";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./schema";
import Axios from "axios";

type Context = { headers: Record<string, string> };

const axios = Axios.create({});

axios.interceptors.response.use((res) => {
  console.log(`URL: ${res.config?.url}\n${JSON.stringify(res.data)}`);
  return res;
});

const UserService = {
  async getAll() {
    return await axios
      .get(`${process.env["USERS_SERVICE_URL"]}`)
      .then((d) => d.data.result);
  },
  async getById({ id }) {
    return await axios
      .get(`${process.env["USERS_SERVICE_URL"]}/${id}`)
      .then((d) => d.data.result);
  },
  async post({ input }) {
    return await axios
      .post(`${process.env["USERS_SERVICE_URL"]}`, input)
      .then((d) => {
        return d.data.result;
      });
  },
} as const;

const ProductService = {
  async getAll() {
    return await axios
      .get(`${process.env["PRODUCTS_SERVICE_URL"]}`)
      .then((d) => d.data.result);
  },
  async getById({ id }) {
    return await axios
      .get(`${process.env["PRODUCTS_SERVICE_URL"]}/${id}`)
      .then((d) => d.data.result);
  },
  async post({ input }, context: Context) {
    const apiKey = context.headers["x-api-key"];
    if (!apiKey || apiKey !== process.env["API_SECRET"])
      return new Error("Invalid api key");
    return await axios
      .post(`${process.env["PRODUCTS_SERVICE_URL"]}/`, input)
      .then((d) => d.data.result);
  },
};

const OrderService = {
  async getAll() {
    return await axios
      .get(`${process.env["ORDERS_SERVICE_URL"]}`)
      .then((d) => d.data.result);
  },
  async getById({ id }) {
    return await axios
      .get(`${process.env["ORDERS_SERVICE_URL"]}/${id}`)
      .then((d) => d.data.result);
  },
  async post({ products }, context: Context) {
    const authorization = context.headers["authorization"];
    let userId = "";
    try {
      const token = authorization.split(" ")[1];
      if (!token) throw Error();
      const payload = verify(token, process.env["API_SECRET"]) as {
        userId: string;
      };
      userId = payload.userId;
    } catch (e) {
      return "Invalid auth";
    }
    return await axios
      .post(
        `${process.env["ORDERS_SERVICE_URL"]}`,
        { products },
        { headers: { "x-user-id": userId } }
      )
      .then((d) => d.data.result);
  },
};

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

// Create and use the GraphQL handler.
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

// Start the server at port
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
