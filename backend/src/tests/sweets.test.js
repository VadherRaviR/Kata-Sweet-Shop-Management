const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = require("../app");
const User = require("../models/User");

let adminToken;
let userToken;

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/sweet-shop-test");

  // Create admin
  await User.create({
    email: "admin@sweet.com",
    password: await bcrypt.hash("password123", 10),
    role: "ADMIN"
  });

  // Create user
  await User.create({
    email: "user@sweet.com",
    password: await bcrypt.hash("password123", 10),
    role: "USER"
  });

  adminToken = (
    await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@sweet.com", password: "password123" })
  ).body.token;

  userToken = (
    await request(app)
      .post("/api/auth/login")
      .send({ email: "user@sweet.com", password: "password123" })
  ).body.token;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("Sweets Module", () => {

  it("admin should create a sweet", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Gulab Jamun",
        category: "Indian",
        price: 10,
        quantity: 50
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Gulab Jamun");
  });

  it("user should NOT create a sweet", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Rasgulla",
        category: "Indian",
        price: 12,
        quantity: 40
      });

    expect(res.statusCode).toBe(403);
  });

});
