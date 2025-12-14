const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = require("../app");
const User = require("../models/User");

let adminToken;
let userToken;

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/sweet-shop-test");

  await User.create({
    email: "admin@sweet.com",
    password: await bcrypt.hash("password123", 10),
    role: "ADMIN"
  });

  await User.create({
    email: "user@sweet.com",
    password: await bcrypt.hash("password123", 10),
    role: "USER"
  });

  const adminLoginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@sweet.com", password: "password123" });

  const userLoginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "user@sweet.com", password: "password123" });

  adminToken = adminLoginRes.body.token;
  userToken = userLoginRes.body.token;

  expect(adminToken).toBeDefined();
  expect(userToken).toBeDefined();
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

  it("user should purchase a sweet and quantity should decrease", async () => {
  // Create sweet as admin
  const sweetRes = await request(app)
    .post("/api/sweets")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Barfi",
      category: "Indian",
      price: 15,
      quantity: 5
    });

  const sweetId = sweetRes.body._id;

  // Purchase as user
  const purchaseRes = await request(app)
    .post(`/api/sweets/${sweetId}/purchase`)
    .set("Authorization", `Bearer ${userToken}`);

  expect(purchaseRes.statusCode).toBe(200);
  expect(purchaseRes.body.quantity).toBe(4);
});
 
it("should not allow purchase when sweet is out of stock", async () => {
  const sweetRes = await request(app)
    .post("/api/sweets")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Ladoo",
      category: "Indian",
      price: 8,
      quantity: 1
    });

  const sweetId = sweetRes.body._id;

  // First purchase (ok)
  await request(app)
    .post(`/api/sweets/${sweetId}/purchase`)
    .set("Authorization", `Bearer ${userToken}`);

  // Second purchase (should fail)
  const secondPurchase = await request(app)
    .post(`/api/sweets/${sweetId}/purchase`)
    .set("Authorization", `Bearer ${userToken}`);

  expect(secondPurchase.statusCode).toBe(400);
});

it("admin should restock a sweet", async () => {
  const sweetRes = await request(app)
    .post("/api/sweets")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Jalebi",
      category: "Indian",
      price: 10,
      quantity: 2
    });

  const sweetId = sweetRes.body._id;

  const restockRes = await request(app)
    .post(`/api/sweets/${sweetId}/restock`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ amount: 5 });

  expect(restockRes.statusCode).toBe(200);
  expect(restockRes.body.quantity).toBe(7);
});
it("should list all available sweets for authenticated user", async () => {
  // Create a sweet as admin
  await request(app)
    .post("/api/sweets")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Peda",
      category: "Indian",
      price: 9,
      quantity: 20
    });

  const res = await request(app)
    .get("/api/sweets")
    .set("Authorization", `Bearer ${userToken}`);

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

});
