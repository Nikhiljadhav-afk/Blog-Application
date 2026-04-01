# 🚀 Blog Application

A full-featured **Spring Boot backend application** for a blogging platform similar to Medium.
This project supports authentication, posts, comments, categories, user profiles, and more.

---

## 📌 Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Refresh token mechanism
* Role-based access control (ADMIN, AUTHOR, USER)
* Secure endpoints using Spring Security

---

### 👤 User Management

* User registration & login
* Profile management (bio, avatar, social links)
* Upgrade user role (ADMIN → AUTHOR)
* View public user profiles

---

### 📝 Post Management

* Create, update, delete posts
* Publish/unpublish posts
* Pagination & filtering:

  ```
  /api/posts?published=true&category=1&page=0&size=10
  ```
* Author-based post retrieval
* Category assignment
* Comment count included in response

---

### 💬 Comments System

* Add comments to posts
* Nested replies (parent-child comments)
* Update/delete comments (only by owner)
* Fetch comments by post

---

### 🏷️ Category Management

* Create, update, delete categories
* Assign categories to posts
* Fetch all categories

---

### 🖼️ File Upload (User Avatar)

* Upload profile avatar
* Store image locally
* Return accessible URL

---

### 🔄 Refresh Token System

* Generate refresh tokens on login
* Token expiration validation
* Logout (token deletion)

---

### ⚙️ Global Exception Handling

* Centralized error handling
* Clean API responses:

  * 400 Bad Request
  * 401 Unauthorized
  * 403 Forbidden
  * 404 Not Found

---

## 🛠️ Tech Stack

* **Backend:** Spring Boot
* **Security:** Spring Security + JWT
* **Database:** MySQL / PostgreSQL
* **ORM:** Spring Data JPA (Hibernate)
* **Build Tool:** Maven
* **Lombok:** For reducing boilerplate code

---

## 📁 Project Structure

```
com.blog
│
├── controller        # REST APIs
├── service           # Business logic
├── service.impl      # Implementations
├── repository        # JPA Repositories
├── entity            # Database entities
├── dto               # Request/Response DTOs
├── config            # Security & JWT config
├── exception         # Custom exceptions
```

---

## 🔑 API Overview

### Auth APIs

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register user |
| POST   | `/api/auth/login`    | Login         |
| POST   | `/api/auth/refresh`  | Refresh token |
| POST   | `/api/auth/logout`   | Logout        |

---

### User APIs

| Method | Endpoint                   | Description      |
| ------ | -------------------------- | ---------------- |
| GET    | `/api/users/me`            | Get current user |
| PUT    | `/api/users/profile`       | Update profile   |
| POST   | `/api/users/upload-avatar` | Upload avatar    |
| GET    | `/api/users/profile/{id}`  | Public profile   |

---

### Post APIs

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | `/api/posts`      |
| GET    | `/api/posts`      |
| GET    | `/api/posts/{id}` |
| PUT    | `/api/posts/{id}` |
| DELETE | `/api/posts/{id}` |

---

### Comment APIs

| Method | Endpoint                      |
| ------ | ----------------------------- |
| POST   | `/api/comments`               |
| PUT    | `/api/comments/{id}`          |
| DELETE | `/api/comments/{id}`          |
| GET    | `/api/comments/post/{postId}` |

---

### Category APIs

| Method | Endpoint               |
| ------ | ---------------------- |
| POST   | `/api/categories`      |
| GET    | `/api/categories`      |
| PUT    | `/api/categories/{id}` |
| DELETE | `/api/categories/{id}` |

---

## 🧪 Testing

Use **Postman** to test APIs.

Steps:

1. Register user
2. Login → get JWT token
3. Use token in headers:

   ```
   Authorization: Bearer <token>
   ```
4. Test secured endpoints

---

## ⚡ Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/Nikhiljadhav-afk/Blog-Application.git
cd blogapp-backend
```

### 2. Configure Database

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/blogapplication
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
```

---

### 3. Run Application

```bash
mvn spring-boot:run
```

---

## 📌 Future Enhancements

* Likes system 👍
* Bookmarks 🔖
* Search functionality 🔍
* Cloud storage (AWS S3 / Cloudinary)
* Notifications 🔔
* Frontend (React integration)

---

## 👨‍💻 Author

**Nikhil Jadhav**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!

---
