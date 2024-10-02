import { Kafka } from "kafkajs";
const kafka = new Kafka({
  clientId: "orders",
  brokers: process.env["KAFKA_BROKERS"].split(" "),
});

const consumer = kafka.consumer({ groupId: "orders" });
const producer = kafka.producer();

export { consumer, producer };
