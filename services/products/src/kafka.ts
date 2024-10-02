import { Kafka } from "kafkajs";
const kafka = new Kafka({
  clientId: "products",
  brokers: process.env["KAFKA_BROKERS"].split(" "),
});

const consumer = kafka.consumer({ groupId: "products" });
const producer = kafka.producer();

export { consumer, producer };
