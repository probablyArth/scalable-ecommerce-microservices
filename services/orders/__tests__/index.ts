process.env["KAFKA_BROKERS"] = "localhost:9092";

import request from "supertest";
import app from "../src/app";
import { Order } from "../src/models";
import axios from "axios";
import { producer } from "../src/kafka";

jest.mock("../src/models");
jest.mock("axios");
jest.mock("../src/kafka");

describe("E2E tests for Express app", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("should return all orders", async () => {
      const mockOrders = [
        { _id: "1", products: [] },
        { _id: "2", products: [] },
      ];
      Order.find = jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockOrders));

      const response = await request(app).get("/");

      expect(response.status).toBe(200);
    });

    it("should handle errors", async () => {
      Order.find = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("Database error")));

      const response = await request(app).get("/");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /:id", () => {
    it("should return a specific order", async () => {
      const mockOrder = { _id: "1", products: [] };
      Order.findById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockOrder));

      const response = await request(app).get("/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: mockOrder });
    });

    it("should return 404 if order not found", async () => {
      Order.findById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));

      const response = await request(app).get("/1");

      expect(response.status).toBe(404);
    });

    it("should handle errors", async () => {
      Order.findById = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("Database error")));

      const response = await request(app).get("/1");

      expect(response.status).toBe(500);
    });
  });

  describe("POST /", () => {
    const validOrderData = {
      products: [{ _id: "1", quantity: 2 }],
    };

    it("should create a new order", async () => {
      const userId = "user123";
      const createdOrder = { _id: "order1", ...validOrderData, userId };

      axios.get = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ data: { result: { _id: userId } } })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({ data: { result: { _id: "1", quantity: 5 } } })
        );

      Order.create = jest
        .fn()
        .mockImplementation(() => Promise.resolve(createdOrder));
      producer.send = jest.fn().mockImplementation(() => Promise.resolve());

      const response = await request(app)
        .post("/")
        .set("x-user-id", userId)
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ result: createdOrder });
      expect(producer.send).toHaveBeenCalledWith({
        topic: "order-events",
        messages: [
          {
            value: JSON.stringify({
              type: "order-placed",
              payload: createdOrder,
            }),
          },
        ],
      });
    });

    it("should return 401 if user is not authorized", async () => {
      axios.get = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("User not found")));

      const response = await request(app)
        .post("/")
        .set("x-user-id", "invalidUser")
        .send(validOrderData);

      expect(response.status).toBe(401);
      expect(response.text).toBe("Unauthorized");
    });

    it("should return 400 if product quantity is insufficient", async () => {
      axios.get = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ data: { result: { _id: "user123" } } })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({ data: { result: { _id: "1", quantity: 1 } } })
        );

      const response = await request(app)
        .post("/")
        .set("x-user-id", "user123")
        .send(validOrderData);

      expect(response.status).toBe(400);
    });

    it("should return 400 if product is not found", async () => {
      axios.get = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ data: { result: { _id: "user123" } } })
        )
        .mockImplementationOnce(() =>
          Promise.reject(new Error("Product not found"))
        );

      const response = await request(app)
        .post("/")
        .set("x-user-id", "user123")
        .send(validOrderData);

      expect(response.status).toBe(400);
    });

    it("should handle validation errors", async () => {
      const response = await request(app)
        .post("/")
        .set("x-user-id", "user123")
        .send({ products: [{ _id: "1", quantity: "invalid" }] });

      expect(response.status).toBe(400);
    });
  });
});
