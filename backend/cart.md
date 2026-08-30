# Vanta E-Commerce - Cart Module

A robust, secure, and fully-typed **Shopping Cart Module** built with **Node.js, Express, TypeScript, Sequelize (MySQL/PostgreSQL), and Zod** following a clean architectural pattern (**Routes ➔ Controllers ➔ Services**).

---

## 🚀 Features
* **Persistent Cart Management:** One active cart per user linked via secure foreign keys.
* **Smart Add-to-Cart:** Automatically adds products or increments quantities if the product already exists in the cart.
* **JWT Authentication:** Secure endpoints protected by custom token verification middleware.
* **Strict Validation:** Request bodies are validated using **Zod** schema validation to block unauthorized fields and ensure data integrity.
* **Joined Product Details:** Retrieve cart items seamlessly joined with product information (`name`, `price`, `sku`, etc.).

---

## 🛠️ Tech Stack
* **Language:** TypeScript
* **Framework:** Express.js
* **ORM:** Sequelize
* **Validation:** Zod
* **Authentication:** JSON Web Tokens (JWT)

---

## 📂 Architecture
```text
backend/
├── model/
│   ├── cartModel.ts
│   └── cartItemModel.ts
├── service/
│   ├── cartService.ts
│   └── jwt/
│       └── verifyToken.ts
├── controllers/
│   └── cartController.ts
├── routes/
│   └── cartRoutes.ts
└── validators/
    └── cartValidators.ts
```

---

## 🔌 API Endpoints & Usage

Base URL: `http://localhost:3000/api/cart`

All endpoints require an `Authorization` header with a valid Bearer token:
```http
Authorization: Bearer <your_jwt_token>
```

### 1. View Cart
* **Method:** `GET`
* **Endpoint:** `/api/cart`
* **Description:** Retrieves the active user's cart along with all items and joined product details.

### 2. Add Item to Cart
* **Method:** `POST`
* **Endpoint:** `/api/cart`
* **Request Body (JSON):**
  ```json
  {
    "product_id": 1,
    "quantity": 2
  }
  ```

### 3. Update Cart Item Quantity
* **Method:** `PATCH`
* **Endpoint:** `/api/cart/:cart_item_id`
* **Request Body (JSON):**
  ```json
  {
    "quantity": 5
  }
  ```

### 4. Remove Item from Cart
* **Method:** `DELETE`
* **Endpoint:** `/api/cart/:cart_item_id`
* **Description:** Deletes a specific cart item entry entirely.

---

## 🚦 Error Handling & Validation
* **`401 Unauthorized`**: Missing or malformed authentication token.
* **`403 Forbidden`**: Invalid or expired JWT token.
* **`400 Bad Request`**: Failed Zod validation (e.g., negative quantity or missing required fields).
