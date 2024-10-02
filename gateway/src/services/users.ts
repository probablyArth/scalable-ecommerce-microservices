import { axios } from "../libs/http";
import Axios from "axios";

const client = Axios.create({
  ...axios.defaults,
  baseURL: process.env["USERS_SERVICE_URL"],
});

const UserService = {
  async getAll() {
    return await client.get("/").then((d) => d.data.result);
  },
  async getById({ id }) {
    return await client.get(`/${id}`).then((d) => d.data.result);
  },
  async post({ input }) {
    return await client.post("/", input).then((d) => {
      return d.data.result;
    });
  },
} as const;

export { UserService };
