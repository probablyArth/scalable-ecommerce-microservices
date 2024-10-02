process.env["API_SECRET"] = "secret";
import request from "supertest";
import nock from "nock";
import app from "../src/app";
import { sign } from "jsonwebtoken";

const graphqlEndpoint = "/graphql";

const USER_SERVICE_URL = process.env["USERS_SERVICE_URL"]!;
const PRODUCT_SERVICE_URL = process.env["PRODUCTS_SERVICE_URL"]!;
const ORDER_SERVICE_URL = process.env["ORDERS_SERVICE_URL"]!;

describe("GraphQL E2E Tests", () => {
  let server;

  beforeAll(() => {
    server = app.listen(4000);
  });

  afterAll((done) => {
    nock.cleanAll();
    server.close(done);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("Query Tests", () => {
    test("should fetch all users", async () => {
      const mockUsers = [
        { _id: "1", username: "user1" },
        { _id: "2", username: "user2" },
      ];

      nock(USER_SERVICE_URL).get("/").reply(200, { result: mockUsers });

      const query = `
        query {
          users {
            _id
            username
          }
        }
      `;

      const response = await request(server)
        .post(graphqlEndpoint)
        .send({ query });
      console.log({ body: response.body });
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("users");
      expect(response.body.data.users).toEqual(mockUsers);
    });

    test("should fetch a single user by ID", async () => {
      const userId = "1";
      const mockUser = { _id: userId, username: "user1" };

      nock(USER_SERVICE_URL).get(`/${userId}`).reply(200, { result: mockUser });

      const query = `
        query {
          user(id: "${userId}") {
            _id
            username
          }
        }
      `;

      const response = await request(server)
        .post(graphqlEndpoint)
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data.user).toEqual(mockUser);
    });
  });

  describe("Mutation Tests", () => {
    test("should register a new user", async () => {
      const newUser = { username: "testuser", password: "testpassword" };
      const mockResponse = {
        access_token: "mock_token",
        user: { _id: "3", username: "testuser" },
      };

      nock(USER_SERVICE_URL)
        .post("/", newUser)
        .reply(201, { result: mockResponse });

      const mutation = `
        mutation {
          registerUser(input: { username: "testuser", password: "testpassword" }) {
            access_token
            user {
              _id
              username
            }
          }
        }
      `;

      const response = await request(server)
        .post(graphqlEndpoint)
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("registerUser");
      expect(response.body.data.registerUser).toEqual(mockResponse);
    });

    test("should create a new product", async () => {
      const newProduct = { name: "Test Product", price: 1000, quantity: 10 };
      const mockResponse = { _id: "3", ...newProduct };

      nock(PRODUCT_SERVICE_URL)
        .post("/", newProduct)
        .reply(201, { result: mockResponse });

      const mutation = `
        mutation {
          createProduct(input: { name: "Test Product", price: 1000, quantity: 10 }) {
            _id
            name
            price
            quantity
          }
        }
      `;

      const response = await request(server)
        .post(graphqlEndpoint)
        .set("x-api-key", process.env["API_SECRET"]!)
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("createProduct");
      expect(response.body.data.createProduct).toEqual(mockResponse);
    });

    test("should place a new order", async () => {
      const newOrder = { products: [{ _id: "1", quantity: 2 }] };
      const mockResponse = { _id: "1", userId: "user1", ...newOrder };

      nock(ORDER_SERVICE_URL)
        .post("/", newOrder)
        .reply(200, { result: mockResponse });

      const mutation = `
        mutation {
          placeOrder(products: [{ _id: "1", quantity: 2 }]) {
            _id
            userId
            products {
              _id
              quantity
            }
          }
        }
      `;
      const token = sign({ userId: "user1" }, process.env["API_SECRET"]!);
      const response = await request(server)
        .post(graphqlEndpoint)
        .set("Authorization", `Bearer ${token}`)
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("placeOrder");
      expect(response.body.data.placeOrder).toEqual(mockResponse);
    });
  });
});
