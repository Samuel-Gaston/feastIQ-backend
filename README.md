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

[Web Frontend →](https://github.com/Samuel-Gaston/feastIQ-web-frontend) · [Mobile Frontend →](https://github.com/Samuel-Gaston/feastIQ-mobile-frontend) 

</div>

---

## About This Repository

This is the **backend API** for [FeastIQ](#) — an AI-powered, multi-restaurant food ordering marketplace. It's built with NestJS for its modularity, built-in dependency injection, decorator-driven validation, and auto-generated Swagger documentation — well suited to a system with three distinct user roles (Customer, Restaurant Owner, Admin) and strict role-based data isolation.

This service owns all core business logic. AI/ML capabilities (recommendations, food image classification, and the LLM ordering assistant) are deliberately kept in a **separate Python/FastAPI microservice**, reached only through this API's `AI Gateway` module — keeping the ML stack independently deployable and the platform resilient if the AI service is ever degraded.

---

##  What This API Does

-  **Auth** — JWT access/refresh tokens, three roles (customer, restaurant_owner, admin), guarded routes
-  **Restaurants & Menus** — owner-managed restaurant profiles, category-based menu items, bulk CSV import, admin approval workflow
-  **Cart & Checkout** — restaurant-scoped cart, delivery fee calculation, Cash-on-Delivery checkout behind a swappable `PaymentStrategy` interface
-  **Orders** — full status lifecycle (`placed → confirmed → preparing → ready_for_pickup → out_for_delivery → delivered`), live updates via WebSocket
-  **Reviews** — post-delivery ratings with restaurant owner responses
-  **Notifications** — push (FCM), email, and in-app notification centre, plus admin broadcast messaging
-  **Admin** — user management, role/permission assignment, restaurant approvals, platform analytics, audit logging
-  **AI Gateway** — the only module that talks to the FastAPI AI service (`/recommend`, `/classify-food`, `/assistant`), with graceful fallback if that service is unavailable

---

##  Architecture Snapshot

```
Client (Web/Mobile)
        │
        ▼
┌───────────────────────┐
│      NestJS API        │
│  ┌───────────────────┐ │
│  │  Auth · Users       │ │
│  │  Restaurants · Menu │ │
│  │  Cart · Orders       │ │
│  │  Reviews · Notifs    │ │
│  │  Admin               │ │──────► FastAPI AI Service
│  │  AI Gateway  ────────┼─┼──────► (Recommendation ·
│  └───────────────────┘ │        Image Classifier ·
└──────────┬─────────────┘        LLM Assistant/Groq)
           │
           ▼
   MongoDB Atlas
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js, TypeScript) |
| Auth | Passport.js, JWT (access + refresh), Bcrypt |
| Database | MongoDB Atlas via Mongoose ODM |
| Validation | class-validator, class-transformer |
| Docs | Swagger / OpenAPI (auto-generated) |
| Media | Cloudinary |
| Notifications | Firebase Cloud Messaging, Nodemailer |
| Testing | Jest |
| CI/CD | GitHub Actions |

---


##  Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas connection string (or local MongoDB)
- Cloudinary account (media uploads)




##  API Documentation

Interactive Swagger documentation is auto-generated from decorators once the server is running. Every endpoint is grouped by module (Auth, Restaurants, Menu Items, Cart, Orders, Reviews, Notifications, Admin, AI Gateway) with request/response schemas.

---

## Related Repositories

| Repo | Description |
|---|---|
| `feastIQ-web-frontend` | Next.js web app — restaurant owner dashboard, admin dashboard |
| `feastIQ-mobile-frontend` | React Native (Expo) customer mobile app |
| `feastIQ-ai-service` | Python/FastAPI AI microservice — recommendation engine, food image classifier, Groq-powered assistant |

---

##  Author

**Samuel Gaston** —Software Engineer



</div>
