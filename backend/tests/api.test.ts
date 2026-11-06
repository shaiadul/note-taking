import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { UserModel } from "../src/models/user.model";
import { NoteModel } from "../src/models/note.model";
import { PostModel } from "../src/models/post.model";
import { UserRole } from "../src/constants/roles.enum";

const TEST_MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/secure_notes_test_db";

describe("Secure Note-Taking Application API Suite", () => {
  let app: any;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGO_URI);
    }
    app = createApp();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await NoteModel.deleteMany({});
    await PostModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await NoteModel.deleteMany({});
    await PostModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("1. Database Indexing Strategy", () => {
    it("should define exact expected indexes using schema.index", async () => {
      await UserModel.syncIndexes();
      await NoteModel.syncIndexes();
      await PostModel.syncIndexes();

      const userIndexes = await UserModel.collection.getIndexes();
      const noteIndexes = await NoteModel.collection.getIndexes();
      const postIndexes = await PostModel.collection.getIndexes();

      expect(userIndexes).toHaveProperty("email_1");
      expect(userIndexes).toHaveProperty("createdAt_-1");
      expect(userIndexes).toHaveProperty("interests_1");

      expect(noteIndexes).toHaveProperty("userId_1_createdAt_-1");
      expect(noteIndexes).toHaveProperty("createdAt_-1");

      expect(postIndexes).toHaveProperty("userId_1_createdAt_-1");
      expect(postIndexes).toHaveProperty("createdAt_-1");
    });
  });

  describe("2. Authentication & Authorization", () => {
    it("should register a user and hash the password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          interests: ["chess", "coding"]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe("john@example.com");
      expect(res.body.data.user.password).toBeUndefined();

      const savedUser = await UserModel.findOne({ email: "john@example.com" });
      expect(savedUser).not.toBeNull();
      expect(savedUser!.password).not.toBe("password123");
    });

    it("should login registered user and provide JWT", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "securePassword123"
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "jane@example.com",
        password: "securePassword123"
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe("jane@example.com");
    });

    it("should reject login with wrong password", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "securePassword123"
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "jane@example.com",
        password: "wrongPassword"
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fetch current user profile via GET /api/auth/me", async () => {
      const reg = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "alice@example.com",
        password: "password123"
      });

      const token = reg.body.data.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("alice@example.com");
    });
  });

  describe("3. Role-Based Access Control (RBAC) & Note Management", () => {
    let regularToken: string;
    let regularUserId: string;
    let adminToken: string;
    let adminUserId: string;

    beforeEach(async () => {
      const userRes = await request(app).post("/api/auth/register").send({
        name: "Regular User",
        email: "user@example.com",
        password: "password123",
        role: UserRole.USER
      });
      regularToken = userRes.body.data.token;
      regularUserId = userRes.body.data.user._id;

      const adminRes = await request(app).post("/api/auth/register").send({
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: UserRole.ADMIN
      });
      adminToken = adminRes.body.data.token;
      adminUserId = adminRes.body.data.user._id;
    });

    it("regular user can create, view, update and delete their own note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${regularToken}`)
        .send({
          title: "My First Note",
          content: "Confidential content"
        });

      expect(createRes.status).toBe(201);
      const noteId = createRes.body.data._id;

      const listRes = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${regularToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.pagination).toBeDefined();

      const getRes = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${regularToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.title).toBe("My First Note");

      const updateRes = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${regularToken}`)
        .send({
          title: "Updated Note Title"
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe("Updated Note Title");

      const deleteRes = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${regularToken}`);
      expect(deleteRes.status).toBe(204);
    });

    it("user cannot access or modify notes of another user", async () => {
      const noteRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Admin Private Note",
          content: "Admin Only Content"
        });
      const noteId = noteRes.body.data._id;

      const forbiddenGet = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${regularToken}`);
      expect(forbiddenGet.status).toBe(403);

      const forbiddenPut = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${regularToken}`)
        .send({ title: "Hacked Title" });
      expect(forbiddenPut.status).toBe(403);

      const forbiddenDelete = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${regularToken}`);
      expect(forbiddenDelete.status).toBe(403);
    });

    it("admin can view everyone's notes and manage users", async () => {
      await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${regularToken}`)
        .send({
          title: "User Note",
          content: "User Content"
        });

      await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Admin Note",
          content: "Admin Content"
        });

      const adminNotesRes = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(adminNotesRes.status).toBe(200);
      expect(adminNotesRes.body.data.length).toBe(2);

      const userNotesRes = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${regularToken}`);
      expect(userNotesRes.status).toBe(200);
      expect(userNotesRes.body.data.length).toBe(1);

      const adminUsersRes = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(adminUsersRes.status).toBe(200);
      expect(adminUsersRes.body.data.length).toBe(2);

      const regularUsersRes = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${regularToken}`);
      expect(regularUsersRes.status).toBe(403);
    });
  });

  describe("4. Aggregations Tasks", () => {
    let testUserId: string;

    beforeEach(async () => {
      const u1 = await UserModel.create({
        name: "Alice",
        email: "alice@agg.com",
        password: "hashedpassword",
        role: UserRole.USER,
        interests: ["chess", "reading", "gaming"]
      });

      const u2 = await UserModel.create({
        name: "Bob",
        email: "bob@agg.com",
        password: "hashedpassword",
        role: UserRole.USER,
        interests: ["chess", "swimming"]
      });

      const u3 = await UserModel.create({
        name: "Charlie",
        email: "charlie@agg.com",
        password: "hashedpassword",
        role: UserRole.USER,
        interests: ["reading"]
      });

      testUserId = u1._id.toString();

      await PostModel.create([
        {
          title: "Alice Post 1",
          content: "First post by Alice",
          userId: u1._id
        },
        {
          title: "Alice Post 2",
          content: "Second post by Alice",
          userId: u1._id
        },
        {
          title: "Bob Post 1",
          content: "First post by Bob",
          userId: u2._id
        }
      ]);
    });

    it("Scenario 1: Group by Interests using single collection.aggregate()", async () => {
      const res = await request(app).get("/api/aggregations/group-by-interests");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const groups = res.body.data;
      const chessGroup = groups.find((g: any) => g._id === "chess");
      expect(chessGroup).toBeDefined();
      expect(chessGroup.totalUsers).toBe(2);

      const readingGroup = groups.find((g: any) => g._id === "reading");
      expect(readingGroup).toBeDefined();
      expect(readingGroup.totalUsers).toBe(2);

      const swimmingGroup = groups.find((g: any) => g._id === "swimming");
      expect(swimmingGroup).toBeDefined();
      expect(swimmingGroup.totalUsers).toBe(1);
    });

    it("Scenario 2: User Posts ($lookup) retrieving all posts belonging to a particular user", async () => {
      const res = await request(app).get(`/api/aggregations/user/${testUserId}/posts`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].author).toBeDefined();
      expect(res.body.data[0].author.name).toBe("Alice");
      expect(res.body.data[0].author.email).toBe("alice@agg.com");
    });

    it("Scenario 2: User profile with posts joined via $lookup", async () => {
      const res = await request(app).get(`/api/aggregations/user/${testUserId}/profile-with-posts`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Alice");
      expect(res.body.data.posts.length).toBe(2);
    });
  });

  describe("5. Rate Limiter & Security Headers", () => {
    it("should include rate limit and security headers", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.headers["x-ratelimit-limit"]).toBeDefined();
      expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
      expect(res.headers["x-ratelimit-reset"]).toBeDefined();
      expect(res.headers["x-dns-prefetch-control"]).toBeDefined();
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
    });
  });
});

