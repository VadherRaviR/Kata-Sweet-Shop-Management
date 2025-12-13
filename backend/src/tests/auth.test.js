const request = require("supertest");
const app = require("../app");

describe("Auth API - TDD Phase", () => {

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.statusCode).toBe(201);
  });

});
