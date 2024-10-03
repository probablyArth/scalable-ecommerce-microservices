# Scalable e-commerce system

![image](https://github.com/user-attachments/assets/62d2a316-2175-43b7-aa9d-6fe530ba4121)

# Api Spec

```graphql
type Query {
  users: [User]
  user(id: ID!): User
  products: [Product]
  product(id: ID!): Product
  orders: [Order]
  order(id: ID!): Order
}

type Mutation {
  registerUser(input: RegisterUserInput): RegisterUserResult
  createProduct(input: CreateProductInput): Product # admin route, x-api-key required in headers, should match API_SECRET in .env
  placeOrder(products: [OrderProductInput]): Order # protected route, should have a Bearer token in Authorization header which is signed using API_SECRET in .env and contains {userId: <your_user_id>} - received as access_token from registerUser mutation
}

type User {
  _id: ID!
  username: String!
}

type Product {
  _id: ID!
  name: String!
  price: Int!
  quantity: Int!
}

type OrderProduct {
  _id: ID!
  quantity: Int!
}

type Order {
  _id: ID!
  userId: ID!
  products: [OrderProduct]
}

input RegisterUserInput {
  username: String!
  password: String!
}

type RegisterUserResult {
  access_token: String!
  user: User!
}

input CreateProductInput {
  name: String!
  price: Int!
  quantity: Int!
}

input OrderProductInput {
  _id: String!
  quantity: Int!
}
```

# Sample queries

```graphql
query Users {
  users {
    _id
    username
  }
}

query Products {
  products {
    _id
    name
    price
    quantity
  }
}

mutation RegisterUser {
  registerUser(input: { username: "arth", password: "password" }) {
    access_token
  }
}

# requires x-api-token (check API_SECRET env var)
mutation CreateProduct {
  createProduct(input: { name: "chocolate", price: 20, quantity: 10 }) {
    _id
    name
    price
    quantity
  }
}

# protected router, requires Bearer token auth, access_token is received from registerUser mutation
mutation PlaceOrder {
  placeOrder(
    products: [
      {
        _id: "Add a valid id received from createProduct or products query"
        quantity: 10
      }
    ]
  ) {
    _id
    products {
      _id
      quantity
    }
    userId
  }
}
```

# Overview

This project implements a robust, scalable e-commerce system using a microservices architecture.

# Architecture

The system is composed of the following key components:

- API Gateway: Acts as the single entry point for all client requests, routing them to appropriate microservices.
- User Service: Manages user authentication and profile information.
- Product Service: Handles product catalog and inventory management.
- Order Service: Processes and manages customer orders.
- Apache Kafka: Facilitates event-driven communication between microservices.
- MongoDB: Provides persistent storage for each microservice.
- Redis: For Caching frequently accessed data (ex: getting a list of products).

# Features

### User Management

- User registration and authentication
- JWT-based secure access

### Product Catalog

- Product creation and management
- Inventory tracking
- Real-time inventory updates

### Order Processing

- Secure order placement
- Inventory reservation system to prevent overselling

### Event-Driven Architecture

Real-time updates across services using Kafka
Improved system resilience and scalability

### GraphQL API

- Flexible and efficient data querying
- Consolidated API for client applications

### Response Caching

- Frequently accessed resource such as list of products is cached in redis and invalidated when inventory is updated.

### Containerization

Docker-based deployment for easy scaling and management

# Technology Stack

- Backend: Node.js with Express.js
- API Gateway: Apollo Server (GraphQL)
- Database: MongoDB
- Message Broker: Apache Kafka
- Authentication: JSON Web Tokens (JWT)
- Containerization: Docker and Docker Compose
- Caching: Redis (K/V)

# Implementation Highlights

### Microservices Communication:

- REST APIs for synchronous communication
- Kafka for asynchronous event-driven updates

### Security:

- JWT authentication for secure API access
- Environment-based configuration for sensitive data

### Scalability:

- Each microservice can be independently scaled
- Used Kafka for decoupling services and handling high loads

## Running locally

The whole system can be run with a single command.

```sh
docker-compose up
```

Go to each service's directory to run them specifically.
