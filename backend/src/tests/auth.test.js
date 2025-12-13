const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/sweet-shop-test");
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth API - TDD Phase", () => {

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.email).toBe("test@example.com");
  });

  it("should login an existing user", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      email: "login@test.com",
      password: "password123"
    });

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "login@test.com",
      password: "password123"
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe("Login successful");
});


});
