# Scalable e-commerce system

![image](https://github.com/user-attachments/assets/62d2a316-2175-43b7-aa9d-6fe530ba4121)

# Overview

This project implements a robust, scalable e-commerce system using a microservices architecture. It leverages modern technologies and design patterns to create a flexible and maintainable platform for online retail operations.

# Architecture

The system is composed of the following key components:

- API Gateway: Acts as the single entry point for all client requests, routing them to appropriate microservices.
- User Service: Manages user authentication and profile information.
- Product Service: Handles product catalog and inventory management.
- Order Service: Processes and manages customer orders.
- Apache Kafka: Facilitates event-driven communication between microservices.
- MongoDB: Provides persistent storage for each microservice.

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

### Containerization

Docker-based deployment for easy scaling and management

# Technology Stack

- Backend: Node.js with Express.js
- API Gateway: Apollo Server (GraphQL)
- Database: MongoDB
- Message Broker: Apache Kafka
- Authentication: JSON Web Tokens (JWT)
- Containerization: Docker and Docker Compose

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
