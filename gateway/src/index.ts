import { config } from "dotenv";
config();
import app from "./app";

import { consumer } from "./libs/kafka";
import { cacheClient } from "./libs/redis";

const main = async () => {
  await cacheClient.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "inventory-events" });
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
