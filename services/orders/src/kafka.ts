import { Kafka, logLevel } from "kafkajs";
const kafka = new Kafka({
  clientId: "orders",
  brokers: process.env["KAFKA_BROKERS"].split(" "),
  logLevel: logLevel.ERROR,
});

const consumer = kafka.consumer({ groupId: "orders" });
const producer = kafka.producer();

export { consumer, producer };
