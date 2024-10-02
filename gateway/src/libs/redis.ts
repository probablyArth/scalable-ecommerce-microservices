import { createClient } from "redis";

const cacheClient = createClient({ url: process.env["REDIS_URL"] });

export { cacheClient };
