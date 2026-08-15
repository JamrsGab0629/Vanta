#### To run


# Prerequisites
```bash
npm install express
npm install typescript
npm install sequelize pg pg-hstore
npm install jsonwebtoken
npm install bcrypt
npm install dotenv
npm install
 npm install -D tsx
```


## Run

```bash
npx tsx config/test.ts (to test db if connected)

```

make sure that your .env is in backend folder




# Authentication & API Testing Guide

A secure Node.js and Express backend featuring JWT authentication using HTTP-only cookies, role-based access control, rate limiting, and database-backed session blacklisting.

---

## 🚀 Getting Started

### Prerequisites
* Node.js installed
* Database configured via your `.env` file

### Running the Server
    npm run dev

---

## 🧪 API Testing Guide (Thunder Client / Postman)

### 1. Register an Account
Before logging in, ensure the test user exists in the database.
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/register`
* **Body (JSON):**
    {
        "email": "james.dev@example.com",
        "password": "strongpassword456"
    }

### 2. Log In
Authenticates the user and sets an HTTP-only cookie containing the JWT with a unique session ID (`jti`).
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/login`
* **Body (JSON):**
    {
        "email": "james.dev@example.com",
        "password": "strongpassword456"
    }
* **Expected Response:** `200 OK` *(Verify that the `token` cookie is successfully stored in your client's cookie jar)*.

### 3. Access Protected Dashboard
Tests whether the middleware successfully reads the HTTP-only cookie, verifies the JWT, and permits access.
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/dashboard`
* **Headers:** None required *(cookie is sent automatically)*.
* **Expected Response:** `200 OK`
    {
        "message": "Welcome to your dashboard!",
        "user": {
            "userId": 4,
            "jti": "696ac21d-9587-40c1-9002-cc6500264756",
            "iat": 1786767955,
            "exp": 1787372755
        }
    }

### 4. Log Out
Extracts the `jti` from the token, registers it inside the database blacklist table, and clears the cookie from the client.
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/logout`
* **Expected Response:** `200 OK`
    {
        "message": "Logged out successfully"
    }

### 5. Verify Blacklist Protection
Ensures that a revoked session token cannot be reused, even if someone attempts to replay it.
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/dashboard`
* **Expected Response:** `401 Unauthorized` *(Blocked because the session `jti` exists in the blacklist table and the cookie has been cleared)*.

---


### Summary of What i Built So Far

Core Express & TypeScript Server Architecture

Configured app.ts and server.ts to boot up the application cleanly.

Integrated express.json() for body parsing, cookie-parser for reading HTTP-only cookies, and cors with credentials configured for frontend framework compatibility.

Added rate-limiting protection to guard endpoints against excessive requests.

Database Setup & Models

Hooked up Sequelize ORM with environment configurations.

Set up database synchronization (sequelize.sync({ alter: true })) to handle user tables and token blacklists automatically.

Advanced Security & Authentication Workflow

HTTP-Only Cookies: Stored session tokens securely in cookies to protect against client-side script theft (XSS).

Unique Session Identifiers (jti): Issued JWTs containing a unique session ID (jti) alongside user details.

Database-Backed Token Blacklisting: Implemented a logout and verification workflow where revoking a session instantly registers its jti in a database blacklist table, ensuring replayed tokens are blocked immediately.

Role-Based Access Control (RBAC): Added middleware to differentiate user access levels (e.g., standard users vs. admins on /api/admin-panel).