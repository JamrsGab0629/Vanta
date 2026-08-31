### 2️⃣ Register a User
Method: POST
URL: http://localhost:3000/api/auth/register
Click the Body tab → select JSON
Paste:
```json
{
  "username": "adminuser",
  "email": "admin@example.com",
  "password": "Password123456"
}
```

### 3️⃣ Verify OTP
Method: POST
URL: http://localhost:3000/api/auth/verify-otp
Body (JSON):
```json
{
  "email": "admin@example.com",
  "otp": "PASTE_YOUR_6_DIGIT_OTP_HERE"
}
---
```
### Promote admin
```sql
UPDATE "Users" SET role = 'admin' WHERE email = 'admin@example.com';
```
---

### 5️⃣ Login as Admin
Method: POST
URL: http://localhost:3000/api/auth/login
Body (JSON):

```json
{
  "email": "admin@example.com",
  "password": "Password123456"
}
```

### 6️⃣ Create a Product (Admin Only)
Method: POST
URL: http://localhost:3000/api/products
Body (JSON):

```json

{
  "sku": "0114-GPU",
  "name": "Ridgeline RX-7800",
  "category": "Graphics Cards",
  "swatch": "RTX-CLASS · 16GB",
  "price": 649.00,
  "stock_quantity": 45,
  "description": "High-performance GPU bench-tested for 1440p and 4K gaming.",
  "specs": {
    "Boost Clock": "2,650 MHz",
    "VRAM": "16GB GDDR6",
    "TDP": "263W"
  },
  "bench_stats": {
    "Cyberpunk 4K": "78 FPS",
    "Max Temp": "64°C"
  }
}
```
---
### 7️⃣ Get All Products (Public — No Login Needed)
Method: GET
URL: http://localhost:3000/api/products
✅ Expected: 200 OK with a list of products

---

### 8️⃣ Get Product by SKU (Public)
Method: GET
URL: http://localhost:3000/api/products/sku/0114-GPU
✅ Expected: 200 OK with matching product

---
### 9️⃣ Update Product (Admin Only)
Method: PUT
URL: http://localhost:3000/api/products/1
Body (JSON):

```json
{
  "price": 599.00,
  "stock_quantity": 50
}
```
---
### 🔟 Delete Product (Admin Only)
Method: DELETE
URL: http://localhost:3000/api/products/1
✅ Expected: 200 OK — "Product deleted successfully"