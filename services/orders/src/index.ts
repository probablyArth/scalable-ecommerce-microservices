import { config } from "dotenv";
config();

import { consumer, producer } from "./kafka";
import mongoose from "mongoose";
import app from "./app";

const main = async () => {
  await mongoose.connect(process.env["MONGO_URI"]);
  await producer.connect();
};

main()
  .then(() => {
    app.listen(process.env["ORDERS_SERVICE_PORT"], () => {
      console.log(
        `Orders service is running on port ${process.env["ORDERS_SERVICE_PORT"]}`
      );
    });
  })
  .catch(async (e) => {
    console.error(e);
    await producer.disconnect();
    await consumer.disconnect();
    process.exit(1);
  });
