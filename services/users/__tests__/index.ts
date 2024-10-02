import request from "supertest";
import app from "../src/app";
import { User } from "../src/models";
import bcrypt from "bcryptjs";

jest.mock("../src/models");
jest.mock("bcryptjs");
jest.mock("../src/jwt");
jest.mock("jsonwebtoken");

describe("User API E2E Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /", () => {
    const validUserData = {
      username: "testuser",
      password: "password123",
    };

    it("should create a new user", async () => {
      const hashedPassword = "hashedpassword123";
      const newUser = {
        _id: "user1",
        username: validUserData.username,
        password: hashedPassword,
      };

      User.findOne = jest.fn().mockImplementation(() => Promise.resolve(null));
      bcrypt.hash = jest.fn().mockImplementation((password, salt, callback) => {
        callback(null, hashedPassword);
      });
      User.create = jest
        .fn()
        .mockImplementation(() => Promise.resolve(newUser));

      const response = await request(app).post("/").send(validUserData);

      expect(response.status).toBe(201);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        validUserData.password,
        10,
        expect.any(Function)
      );
    });

    it("should return 400 if username already exists", async () => {
      User.findOne = jest
        .fn()
        .mockResolvedValue({ username: validUserData.username });

      const response = await request(app).post("/").send(validUserData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Username already exists" });
    });

    it("should return 400 for invalid user data", async () => {
      const invalidUserData = {
        username: "testuser",
        password: 123, // Should be a string
      };

      const response = await request(app).post("/").send(invalidUserData);

      expect(response.status).toBe(400);
    });

    it("should handle bcrypt error", async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockImplementation((password, salt, callback) => {
        callback(new Error("Bcrypt error"), null);
      });

      const response = await request(app).post("/").send(validUserData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Bcrypt error" });
    });

    it("should handle server errors", async () => {
      User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/").send(validUserData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });

  describe("GET /:id", () => {
    it("should return a specific user", async () => {
      const mockUser = { _id: "user1", username: "testuser" };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).get("/user1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: mockUser });
    });

    it("should return 404 for non-existent user", async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).get("/nonexistent");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found" });
    });

    it("should handle server errors", async () => {
      User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/user1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });

  describe("GET /", () => {
    it("should return all users", async () => {
      const mockUsers = [
        { _id: "user1", username: "user1" },
        { _id: "user2", username: "user2" },
      ];
      User.find = jest.fn().mockResolvedValue(mockUsers);

      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: mockUsers });
    });

    it("should handle server errors", async () => {
      User.find = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });
});
