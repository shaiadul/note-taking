import { Database } from "../config/database.config";
import { UserModel } from "../models/user.model";
import { NoteModel } from "../models/note.model";
import { PostModel } from "../models/post.model";
import { UserRole } from "../constants/roles.enum";
import { PasswordUtil } from "../utils/password.util";
import { logger } from "../utils/logger";

const seed = async () => {
  const db = Database.getInstance();
  await db.connect();

  logger.info("Starting database seed...");

  await UserModel.deleteMany({});
  await NoteModel.deleteMany({});
  await PostModel.deleteMany({});

  const adminPassword = await PasswordUtil.hash("admin123");
  const userPassword = await PasswordUtil.hash("user123");

  const admin = await UserModel.create({
    name: "System Admin",
    email: "admin@example.com",
    password: adminPassword,
    role: UserRole.ADMIN,
    interests: ["security", "chess", "architecture"]
  });

  const alice = await UserModel.create({
    name: "Alice Johnson",
    email: "alice@example.com",
    password: userPassword,
    role: UserRole.USER,
    interests: ["chess", "reading", "ai"]
  });

  const bob = await UserModel.create({
    name: "Bob Smith",
    email: "bob@example.com",
    password: userPassword,
    role: UserRole.USER,
    interests: ["reading", "hiking", "photography"]
  });

  const charlie = await UserModel.create({
    name: "Charlie Brown",
    email: "charlie@example.com",
    password: userPassword,
    role: UserRole.USER,
    interests: ["chess", "hiking"]
  });

  await NoteModel.create([
    {
      title: "Admin System Architecture Blueprint",
      content: "Ensure all endpoints implement RBAC and database indexes match ESR rule.",
      userId: admin._id
    },
    {
      title: "Alice Private Study Plan",
      content: "Complete chapters on MongoDB aggregation pipelines and compound indexes.",
      userId: alice._id
    },
    {
      title: "Alice Meeting Summary",
      content: "Discussed database optimization strategies with the engineering team.",
      userId: alice._id
    },
    {
      title: "Bob Weekend Trip Checklist",
      content: "Pack hiking boots, camera gear, and notebook.",
      userId: bob._id
    }
  ]);

  await PostModel.create([
    {
      title: "Understanding MongoDB Aggregations",
      content: "MongoDB aggregation pipelines process documents through multi-stage sequences to transform data into aggregated results.",
      userId: alice._id
    },
    {
      title: "Optimizing Read Performance with Compound Indexes",
      content: "When queries filter on one field and sort on another, compound indexes like { userId: 1, createdAt: -1 } prevent in-memory sorts.",
      userId: alice._id
    },
    {
      title: "Top 5 Hiking Trails for Developers",
      content: "Taking regular breaks from coding to explore nature improves creativity and problem solving.",
      userId: bob._id
    },
    {
      title: "Why Loose Coupling Matters in Node.js",
      content: "Decoupling controllers from database queries using the repository pattern enables clean unit testing and mockability.",
      userId: charlie._id
    }
  ]);

  logger.info("Database seeded successfully!");
  logger.info("Admin Credentials: admin@example.com / admin123");
  logger.info("User Credentials: alice@example.com / user123 (or bob@example.com / user123)");

  await db.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error({ err }, "Seeding failed");
  process.exit(1);
});

