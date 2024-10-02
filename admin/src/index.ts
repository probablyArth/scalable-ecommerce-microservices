/// <reference path="../../global.d.ts" />

import { config } from "dotenv";

config();
import { Kafka } from "kafkajs";
import { Topics } from "./topics";

const kafka = new Kafka({
  brokers: process.env["KAFKA_BROKERS"].split(" "),
});

const admin = kafka.admin();

const main = async () => {
  console.log("Creating topics");
  await admin
    .createTopics({ topics: Topics.map((topic) => ({ topic })) })
    .then((d) => {
      if (d) {
        console.log("Topics created");
      } else {
        console.log("Topics already created.");
      }
    });
  await admin.listTopics().then(console.log);
  console.log("Disconnecting admin...");
  await admin.disconnect();
};

main();
