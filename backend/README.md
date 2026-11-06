# Secure Note-Taking Application - Backend

Production-ready, enterprise-grade RESTful API built with TypeScript, Node.js, Express, MongoDB/Mongoose, and Redis (Upstash) rate limiting.

---

## 1. Architectural Design & OOP Principles

This service follows a strict **Layered Architecture** adhering to **SOLID principles** and **Loose Coupling**:

- **Presentation Layer (`src/controllers/`, `src/routes/`)**: Handles HTTP requests, parameter extraction, and standardized response formatting via `BaseController`.
- **Business Logic Layer (`src/services/`)**: Enforces business rules, access control, and domain calculations. Decoupled via `interface` abstractions.
- **Data Access Layer (`src/repositories/`)**: Encapsulates all Mongoose queries, aggregations, and pagination logic behind repository interfaces (`IBaseRepository`, `IUserRepository`, etc.).
- **Domain Models (`src/models/`)**: Mongoose schemas declaring schema structure, data transformations, and explicit `schema.index` definitions.
- **Dependency Injection (Composition Root in `src/app.ts`)**: Dependencies are injected via constructors (Controller <- Service <- Repository), eliminating global singletons and enabling unit testing and mocking.
- **Rate Limiting Strategy Pattern (`src/middlewares/rate-limiter.middleware.ts`)**: Uses an `IRateLimiterStrategy` interface with `UpstashRateLimiterStrategy` (using `@upstash/ratelimit` & `@upstash/redis`) and `MemoryRateLimiterStrategy` (high-performance fallback for offline/test environments).

---

## 2. Database Indexing Strategy (Zero Redundancy)

All indexes are explicitly registered using Mongoose's `schema.index(...)` method:

### `User` Collection
1. `UserSchema.index({ email: 1 }, { unique: true })`
   - **Supported Operations**: Authentication lookup (`POST /api/auth/login`), registration uniqueness verification, and profile lookup.
2. `UserSchema.index({ createdAt: -1 })`
   - **Supported Operations**: Admin paginated listing of all registered users (`GET /api/users`), satisfying ESR sorting requirements.
3. `UserSchema.index({ interests: 1 })`
   - **Supported Operations**: Scenario 1 Aggregation Pipeline (`$unwind` and grouping by `interests`).

### `Note` Collection
1. `NoteSchema.index({ userId: 1, createdAt: -1 })`
   - **Supported Operations**: Standard user paginated note listing (`GET /api/notes`) filtered by `userId` and sorted descending by `createdAt`.
2. `NoteSchema.index({ createdAt: -1 })`
   - **Supported Operations**: Admin view of all notes across the platform (`GET /api/notes`) sorted descending by `createdAt`.
*(Note: Note lookup by `_id` utilizes MongoDB's default unique `_id_` primary index; no duplicate index created).*

### `Post` Collection
1. `PostSchema.index({ userId: 1, createdAt: -1 })`
   - **Supported Operations**: Scenario 2 Aggregation Pipeline (`$lookup` matching `foreignField: "userId"` and filtering/sorting user posts).
2. `PostSchema.index({ createdAt: -1 })`
   - **Supported Operations**: Public paginated listing of all platform posts (`GET /api/posts`).

---

## 3. Aggregation Pipelines

### Scenario 1: Group by Interests
- **Requirement**: Users have an array of interests (`interests: string[]`). Provide a specific view to see users grouped by interest.
- **Constraint**: Exactly one `collection.aggregate()` call.
- **Pipeline Implementation**:
  ```typescript
  UserModel.aggregate([
    { $unwind: "$interests" },
    {
      $group: {
        _id: "$interests",
        users: {
          $push: { _id: "$_id", name: "$name", email: "$email", role: "$role" }
        },
        totalUsers: { $sum: 1 }
      }
    },
    { $sort: { totalUsers: -1, _id: 1 } }
  ]);
  ```
- **Endpoint**: `GET /api/aggregations/group-by-interests`

### Scenario 2: User Posts ($lookup)
- **Requirement**: Posts are stored in a separate collection. Retrieve all posts belonging to a particular user.
- **Constraint**: Single aggregation pipeline with a `$lookup` stage.
- **Pipeline Implementation**:
  ```typescript
  PostModel.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "author"
      }
    },
    { $unwind: "$author" },
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        author: { _id: "$author._id", name: "$author.name", email: "$author.email" }
      }
    }
  ]);
  ```
- **Endpoints**:
  - `GET /api/aggregations/user/:userId/posts`
  - `GET /api/aggregations/user/:userId/profile-with-posts`

---

## 4. Security & Production Features

- **Authentication**: JWT (JSON Web Tokens) with cryptographically secure secret and expiration.
- **Password Hashing**: `bcryptjs` with configurable salt rounds (12 rounds default).
- **Role-Based Access Control (RBAC)**: Fine-grained middleware restricting routes by role (`user` vs `admin`).
- **Rate Limiting**: Upstash Redis distributed sliding-window rate limiting with automated in-memory fallback.
- **Structured Logging**: `pino` and `pino-http` logger with correlation IDs (`x-request-id`) and header redaction for sensitive data (`authorization`, `cookie`).
- **Input Validation**: Strict `zod` schemas for request bodies, URL parameters, and query strings.
- **Security Headers**: `helmet` configured for XSS, CSP, MIME-sniffing, and clickjacking protection.
- **Centralized Error Handling**: OOP `AppError` hierarchy; sanitized responses preventing sensitive stack leak in production.
- **Graceful Shutdown**: Intercepts `SIGINT`/`SIGTERM` to close HTTP listeners and MongoDB connections cleanly.

---

## 5. API Reference

### Auth (`/api/auth`)
- `POST /register`: Register user `{ name, email, password, role?, interests? }`
- `POST /login`: Authenticate and receive JWT `{ email, password }`
- `GET /me`: Get authenticated user profile (Bearer token required)

### Users (`/api/users`) - Admin Only
- `POST /`: Create user
- `GET /?page=1&limit=10`: Paginated list of users
- `GET /:id`: Get user by ID
- `PUT /:id`: Update user
- `DELETE /:id`: Remove user

### Notes (`/api/notes`)
- `POST /`: Create a note `{ title, content }`
- `GET /?page=1&limit=10`: List notes (User sees own notes; Admin sees all notes)
- `GET /:id`: Get note by ID (User can only read own note; Admin can read any)
- `PUT /:id`: Update note (User can only update own note; Admin can update any)
- `DELETE /:id`: Delete note (User can only delete own note; Admin can delete any)

### Posts (`/api/posts`)
- `POST /`: Create a post `{ title, content }`
- `GET /?page=1&limit=10`: Public paginated list of all posts
- `GET /:id`: Get specific post
- `GET /user/:userId`: Get all posts by user via `$lookup` aggregation
- `PUT /:id`: Update post (Owner or Admin)
- `DELETE /:id`: Delete post (Owner or Admin)

### Aggregations (`/api/aggregations`)
- `GET /group-by-interests`: Group users by interests using single aggregation
- `GET /user/:userId/posts`: Retrieve all posts belonging to a user using single aggregation with `$lookup`
- `GET /user/:userId/profile-with-posts`: Retrieve user profile with joined posts array via `$lookup`

---

## 6. Setup & Execution

### Prerequisites
- Node.js >= 20
- MongoDB instance (local or MongoDB Atlas)
- Optional: Upstash Redis account for cloud-managed distributed rate limiting

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` if using Upstash Redis; otherwise the app will automatically run using the high-performance memory strategy.

### Build and Run
```bash
# Run server directly with tsx
npm start

# Run in development mode with live reload
npm run dev

# Run automated test suite
npm test

# Type-check TypeScript codebase
npm run build
```

