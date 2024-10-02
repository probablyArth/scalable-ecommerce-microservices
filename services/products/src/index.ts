import { config } from "dotenv";
config();
import { consumer, producer } from "./kafka";
import { OrderEventPayload } from "./types";
import { Product } from "./models";
import mongoose from "mongoose";
import app from "./app";

const main = async () => {
  await mongoose.connect(process.env["MONGO_URI"]);
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "order-events" }).then(() => {
    "Consumer subscribed to order-events";
  });
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value.toString()) as OrderEventPayload;
      console.log(
        `[TOPIC]: [${topic}] | PART: ${partition} | EVENT: ${value.type}`
      );
      if (value.type === "order-placed") {
        for (const product of value.payload.products) {
          const existingProduct = await Product.findById(product._id);
          if (existingProduct) {
            existingProduct.quantity -= product.quantity;
            await existingProduct.save();
            await producer.send({
              topic: "inventory-events",
              messages: [
                {
                  value: JSON.stringify({
                    type: "product-updated",
                    payload: product,
                  }),
                },
              ],
            });
          }
        }
      }
    },
  });
};

main()
  .then(() => {
    app.listen(process.env["PRODUCTS_SERVICE_PORT"], () => {
      console.log(
        `Products service is running on port ${process.env["PRODUCTS_SERVICE_PORT"]}`
      );
    });
  })
  .catch(async (e) => {
    console.error(e);
    await consumer.disconnect();
    await producer.disconnect();
    process.exit(1);
  });
