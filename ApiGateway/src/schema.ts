import { buildSchema } from "graphql";

const schema = buildSchema(`
  type User {
    _id: ID!
    username: String!
  }

  type Product {
    _id: ID!
    name: String!
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
    quantity: Int!
  }

  input OrderProductInput {
    _id: String!
    quantity: Int!
  }

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
    createProduct(input: CreateProductInput): Product
    placeOrder(products: [OrderProductInput]): Order
  }
`);

export { schema };
