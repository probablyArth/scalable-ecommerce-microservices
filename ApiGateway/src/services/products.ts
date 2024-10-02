import { axios } from "../libs/http";
import Axios from "axios";
import { Context } from "../types";
import { cacheClient } from "../libs/redis";

const client = Axios.create({
  ...axios.defaults,
  baseURL: process.env["PRODUCTS_SERVICE_URL"],
});

const ProductService = {
  async getAll() {
    try {
      const cached = await cacheClient.get("products/");
      if (!cached) throw Error("cache not found");
      return JSON.parse(cached);
    } catch (e) {
      const data = await client.get("/").then((d) => d.data.result);
      await cacheClient.set("products/", JSON.stringify(data));
      return data;
    }
  },
  async getById({ id }) {
    return await client.get(`/${id}`).then((d) => d.data.result);
  },
  async post({ input }, context: Context) {
    const apiKey = context.headers["x-api-key"];
    if (!apiKey || apiKey !== process.env["API_SECRET"])
      return new Error("Invalid api key");
    return await client.post("/", input).then((d) => d.data.result);
  },
} as const;

export { ProductService };
