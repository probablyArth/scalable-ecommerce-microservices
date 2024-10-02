import { Kafka, logLevel } from "kafkajs";
const kafka = new Kafka({
  clientId: "graphql-gateway",
  brokers: process.env["KAFKA_BROKERS"].split(" "),
  logLevel: logLevel.ERROR,
});

const consumer = kafka.consumer({ groupId: "graphql-gateway" });
const producer = kafka.producer();

export { consumer, producer };
