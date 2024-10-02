import { axios } from "../libs/http";
import Axios from "axios";
import { Context } from "../types";
import { verify } from "jsonwebtoken";

const client = Axios.create({
  ...axios.defaults,
  baseURL: process.env["ORDERS_SERVICE_URL"],
});

const OrderService = {
  async getAll() {
    return await client.get("/").then((d) => d.data.result);
  },
  async getById({ id }) {
    return await client.get(`/${id}`).then((d) => d.data.result);
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
    return await client
      .post(`/`, { products }, { headers: { "x-user-id": userId } })
      .then((d) => d.data.result);
  },
} as const;

export { OrderService };
