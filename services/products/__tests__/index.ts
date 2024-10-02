import request from "supertest";
import app from "../src/app";
import { Product } from "../src/models";
import { producer } from "../src/kafka";

jest.mock("../src/models");
jest.mock("../src/kafka");

describe("Product API E2E Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /", () => {
    const validProductData = {
      name: "Test Product",
      price: 9.99,
      quantity: 100,
    };

    it("should create a new product", async () => {
      const createdProduct = { _id: "product1", ...validProductData };
      Product.create = jest
        .fn()
        .mockImplementation(() => Promise.resolve(createdProduct));
      producer.send = jest.fn().mockImplementation(() => Promise.resolve());

      const response = await request(app).post("/").send(validProductData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: createdProduct });
      expect(producer.send).toHaveBeenCalledWith({
        topic: "inventory-events",
        messages: [
          {
            value: JSON.stringify({
              type: "product-created",
              payload: createdProduct,
            }),
          },
        ],
      });
    });

    it("should return 400 for invalid product data", async () => {
      const invalidProductData = {
        name: "Test Product",
        price: "invalid",
        quantity: 100,
      };

      const response = await request(app).post("/").send(invalidProductData);

      expect(response.status).toBe(400);
    });

    it("should handle server errors", async () => {
      Product.create = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("Database error")));

      const response = await request(app).post("/").send(validProductData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });

  describe("GET /", () => {
    it("should return all products", async () => {
      const mockProducts = [
        { _id: "1", name: "Product 1", price: 10, quantity: 50 },
        { _id: "2", name: "Product 2", price: 20, quantity: 30 },
      ];
      Product.find = jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockProducts));

      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: mockProducts });
    });

    it("should handle server errors", async () => {
      Product.find = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("Database error")));

      const response = await request(app).get("/");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });

  describe("GET /:id", () => {
    it("should return a specific product", async () => {
      const mockProduct = {
        _id: "1",
        name: "Product 1",
        price: 10,
        quantity: 50,
      };
      Product.findById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockProduct));

      const response = await request(app).get("/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: mockProduct });
    });

    it("should handle non-existent product", async () => {
      Product.findById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));

      const response = await request(app).get("/nonexistent");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: null });
    });

    it("should handle server errors", async () => {
      Product.findById = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("Database error")));

      const response = await request(app).get("/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });
});
