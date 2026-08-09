<div align="center">

# FeastIQ — Backend API

**The core NestJS REST API + WebSocket gateway powering the FeastIQ food ordering marketplace.**

Handles authentication, restaurants, menus, cart, orders, reviews, notifications, and admin operations — and acts as the sole integration point between the platform and the AI/ML service.

[![NestJS](https://img.shields.io/badge/Framework-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

[Web Frontend →](https://github.com/Samuel-Gaston/feastIQ-web-frontend) · [Mobile Frontend →](https://github.com/Samuel-Gaston/feastIQ-mobile-frontend) · [AI/ML Service →](https://github.com/Samuel-Gaston/feastIQ-AI_ML)

</div>

---

## About This Repository

This is the **backend API** for [FeastIQ](#) — an AI-powered, multi-restaurant food ordering marketplace. It's built with NestJS for its modularity, built-in dependency injection, decorator-driven validation, and auto-generated Swagger documentation — well suited to a system with three distinct user roles (Customer, Restaurant Owner, Admin) and strict role-based data isolation.

This service owns all core business logic. AI/ML capabilities (recommendations and food image classification) are handled by a **separate Python/FastAPI microservice**, reached only through this API's `AI Gateway` module. The conversational ordering assistant is a distinct feature — a direct Groq API integration built into this backend's own `chat` module, not part of the Python service.

---

## What This API Does

- **Auth** — JWT access/refresh tokens, three roles (customer, restaurant, admin), guarded routes
- **Restaurants & Menus** — owner-managed restaurant profiles, category-based menu items, bulk import, admin approval workflow
- **Cart & Checkout** — restaurant-scoped cart, Cash-on-Delivery checkout
- **Orders** — full status lifecycle (`placed → confirmed → preparing → ready_for_pickup → out_for_delivery → delivered`), notification hooks on every transition
- **Reviews** — post-delivery ratings with restaurant owner responses
- **Notifications** — push (FCM), email, and in-app notification centre, plus admin broadcast messaging
- **Admin** — user management, role/permission assignment, restaurant approvals, platform analytics, audit logging
- **AI Gateway** — the only module that talks to the FastAPI AI service (`/recommend`, `/classify-food`), with graceful fallback if that service is unavailable
- **Chat Assistant** — direct Groq API integration for general platform support/FAQ, with tool calls scoped to the logged-in customer's own orders



## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js, TypeScript) |
| Auth | Passport.js, JWT (access + refresh), Bcrypt |
| Database | MongoDB Atlas via Mongoose ODM |
| i18n | nestjs-i18n (English/French) |
| Docs | Swagger / OpenAPI (auto-generated) |
| Media | Cloudinary |
| Notifications | Firebase Cloud Messaging, Nodemailer |
| LLM | Groq API (direct integration, chat module) |
| Testing | Jest |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas connection string (or local MongoDB)
- Cloudinary account (media uploads)
- Groq API key (chat assistant)

### Installation

```bash
git clone https://github.com/Samuel-Gaston/feastIQ-backend.git
cd feastIQ-backend
npm install
```

### Run

```bash
npm run start:dev
```

The API seeds ~100 sample restaurants/menu items automatically on first run if the database is empty.

---

## API Documentation

Interactive Swagger documentation is auto-generated from decorators once the server is running. Every endpoint is grouped by module (Auth, Restaurants, Menu Items, Cart, Orders, Reviews, Notifications, Admin, AI Gateway, Chat) with request/response schemas.

---

## Related Repositories

| Repo | Description |
|---|---|
| [`feastIQ-web-frontend`](https://github.com/Samuel-Gaston/feastIQ-web-frontend) | Next.js web app — restaurant owner dashboard, admin dashboard |
| [`feastIQ-mobile-frontend`](https://github.com/Samuel-Gaston/feastIQ-mobile-frontend) | React Native (Expo) customer mobile app |
| [`feastIQ-AI_ML`](https://github.com/Samuel-Gaston/feastIQ-AI_ML) | Python/FastAPI AI microservice — recommendation engine, food image classifier |

---

## Author

**Samuel Gaston** — Software Engineer

---

## License

This project is licensed under the MIT License.

</div>
