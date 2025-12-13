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

 it("should login and return jwt token", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      email: "jwt@test.com",
      password: "password123"
    });

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "jwt@test.com",
      password: "password123"
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.token).toBeDefined();
});

it("should deny access to admin route for normal user", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      email: "user@test.com",
      password: "password123"
    });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "user@test.com",
      password: "password123"
    });

  const token = loginRes.body.token;

  const response = await request(app)
    .get("/api/admin/test")
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(403);
});


});
