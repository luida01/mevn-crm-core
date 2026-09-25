# 📚 MangaGo - Manga Store & Rental Platform

A modern, full-stack MEVN application for managing a manga store inventory, rentals, and sales. Built with a premium UI, dual-frontend architecture, and powerful external API integrations.

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🌟 Overview

This project is a **comprehensive manga management platform** with a **dual-frontend architecture**:
- 🏢 **Admin Panel** (`frontend-admin`): Complete CRM for inventory, customers, and rental management
- 🛍️ **Customer Shop** (`frontend`): E-commerce portal with curated collections and premium UI
- 🔗 **External API Integration**: MyAnimeList (Jikan) for metadata and MangaDex for high-quality covers
- 📦 **Volume-Level Tracking**: Individual volume management with specific covers and stock control

## 🏗️ Project Structure

```
mevn-crm-manga/
├── backend/           # Node.js + Express API
├── frontend/          # Customer-facing shop (port 5173)
├── frontend-admin/    # Admin dashboard (port 5174)
├── docs/              # Documentation
└── docker-compose.yml # Container orchestration
```

## 📋 Key Features

### 🎯 Core Functionality

✅ **Hybrid Inventory System**
- Import metadata from MyAnimeList (Jikan API)
- Fetch high-quality volume-specific covers from MangaDex
- Intelligent search with spin-off filtering

✅ **Dual-Frontend Architecture**
- **Admin Panel** (`frontend-admin`): Odoo-style CRM dashboard for managing inventory, customers, and rentals
- **Shop Portal** (`frontend`): Customer-facing e-commerce with curated collections, policies, and FAQ

✅ **Volume Management**
- Track individual manga volumes with specific covers
- Stock control per volume
- Differentiated pricing (sale vs rental)

✅ **Smart Collections**
- **Trending Now**: Top-rated manga (MAL score ≥ 7.5)
- **Recent Arrivals**: Last 6 items added to inventory
- **Thematic Collections**: Beginner-friendly, Anime Adaptations, Horror
- **Author Collections**: Grouped by popular authors
- **Community Reads**: Most read this week, most rented today

✅ **Customer & Rental Management**
- Complete customer profiles with address and contact info
- Rental tracking with status (ACTIVE, RETURNED, LATE)
- Due date management and payment tracking

✅ **Premium UI**
- Responsive grid layout with TailwindCSS
- Immersive details modal with synopsis and genres
- Dynamic status indicators (In Stock / Out of Stock)
- Interactive carousels and collections

## 🚀 Quick Start

### Prerequisites
- Node.js & npm
- Docker & Docker Compose (optional)
- MongoDB (local or Atlas)

### Series and volume data model

Series metadata (title, author, genres, publication details and external IDs) is stored once in `MangaSeries`. Each `Manga` document represents a physical volume and keeps its volume number, ISBN, individual cover, prices and stock. Existing flat API payloads remain compatible with both frontends.

Before upgrading an existing database to this version, run the idempotent migration with the backend environment configured:

```bash
cd backend
npm run migrate:series
```

The migration groups records by normalized title, records differing authors as aliases, and leaves volume numbers, covers, prices and stock on the original volume documents.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/luida01/mevn-crm-core.git
   cd mevn-crm-core
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env with: MONGODB_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, CORS_ORIGINS
   npm run dev
   ```

3. **Frontend Shop Setup**
   ```bash
   cd frontend
   npm install
   npm run dev  # Runs on port 5173
   ```

4. **Frontend Admin Setup**
   ```bash
   cd frontend-admin
   npm install
   npm run dev  # Runs on port 5174
   ```
   Then open `http://localhost:5174/login` and authenticate with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

5. **Docker (All Services)**
   ```bash
   # Copy .env.example to .env, then set a random JWT_SECRET (32+ characters)
   # and an ADMIN_PASSWORD (12+ characters).
   docker compose up --build
   ```
   Open `http://localhost:5173` for the shop and `http://localhost:5174/login` for admin. MongoDB data persists in the `mongo-data` volume. The optional seed is safe to rerun and only inserts missing records:
   ```bash
   docker compose exec backend npm run seed
   ```

## 🛠️ Tech Stack

### Admin workflows and checks

- Pipeline groups rentals into active, overdue, returned/unpaid and completed. Return and payment actions drive those stages.
- Invoicing records payments and issues one printable internal receipt per rental. Receipts preserve issuer, customer, manga and amount snapshots; payment status stays linked to the rental. These are not fiscal invoices and do not process online payments.
- The mixed shop cart checks out purchases and rentals together through Stripe Checkout in test mode. The backend calculates prices from inventory, reserves units atomically for 30 minutes, receives signed Stripe webhooks, creates rentals after paid checkouts, and stores an internal printable order receipt. Stripe keys are optional for running the app; checkout stays disabled until valid test keys are configured.
- Settings stores business contact details and suggested rental days. Updates affect future receipts and new rental forms.
- The public catalog includes every volume, even when stock is zero; search and availability filters are available. Remote imports start with zero stock and zero prices until staff updates them.
- With MongoDB running locally, run `npm run check:workflows` from `backend`. It builds the API, starts an isolated instance, checks customer/inventory/rental/payment/receipt/settings flows and deletes its own randomly named test database. `TEST_MONGODB_URI` optionally overrides the MongoDB server; no application records are used.

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5.1.0
- **Database**: MongoDB 9.0.0 with Mongoose ODM
- **External APIs**:
  - **Jikan API**: MyAnimeList metadata (title, author, genre, score, status)
  - **MangaDex API**: High-quality volume-specific cover images
- **Tools**: Axios, CORS, dotenv
- **Security**: Helmet headers, allowlisted CORS, HS256 JWTs, login rate limiting, and bounded JSON request bodies

### Frontend (Shop & Admin)
- **Framework**: Vue 3.5.24 (Composition API)
- **Build Tool**: Vite 7.2.4
- **State Management**: Pinia 3.0.4
- **Routing**: Vue Router 4.6.3
- **Styling**: TailwindCSS 3.4.17
- **Language**: TypeScript 5.9.3

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Services**:
  - MongoDB (port 27017)
  - Backend API (port 5000)
  - Frontend Shop (port 5173)
  - Frontend Admin (port 5174)

## 📊 Data Models

### Manga
- Volume-level tracking with individual covers
- Dual pricing (sale + rental)
- MyAnimeList integration (score, status, ID)
- Stock management

### Customer
- Complete profile with address
- Virtual relationship with rentals
- Active/inactive status

### Rental
- Customer and manga references
- Status tracking (ACTIVE, RETURNED, LATE)
- Due date and payment management

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Returns JWT token for admin access

### Security Notes
- All `/api/mangas`, `/api/customers`, and `/api/rentals` routes expect `Authorization: Bearer <token>`
- CORS is restricted by `CORS_ORIGINS` (comma-separated origins)
- Set `JWT_SECRET` to at least 32 characters and `ADMIN_PASSWORD` to at least 12 characters. Compose binds service ports to localhost and reads secrets from the ignored root `.env` file.
- `GET /health/live` reports that the API process is running; `GET /health/ready` reports whether MongoDB is connected.

### Manga Management
- `GET /api/mangas` - List all manga
- `GET /api/mangas/:id` - Get specific manga
- `POST /api/mangas` - Create new manga (admin token required)
- `PUT /api/mangas/:id` - Update manga (admin token required)
- `DELETE /api/mangas/:id` - Delete manga (admin token required)
- `GET /api/mangas/search?q=query` - Search local inventory
- `GET /api/mangas/search-remote?q=query` - Search MyAnimeList
- `GET /api/mangas/cover?title=X&volume=Y` - Fetch MangaDex cover

### Shop (E-commerce)
- `GET /api/shop/top-rated?limit=10` - Top-rated manga (MAL ≥ 7.5)
- `GET /api/shop/recent?limit=6` - Recent additions
- `GET /api/shop/collections/:theme` - Thematic collections
- `GET /api/shop/author/:author` - Manga by author
- `GET /api/shop/top-authors?limit=6` - Popular authors
- `GET /api/shop/most-read-week` - Weekly rentals (currently used as a reading-interest proxy)
- `GET /api/shop/most-rented-today` - Daily rental rankings
- `GET /api/checkout/config` - Reports whether Stripe test checkout is configured
- `POST /api/checkout/session` - Validates customer/cart, reserves stock and creates a Stripe Checkout session (requires `Idempotency-Key`)
- `GET /api/checkout/confirmation/:sessionId` - Returns safe order status and internal receipt after payment
- `POST /api/payments/webhook` - Receives signed Stripe events; use Stripe CLI to forward test events
- `GET /api/orders` - Admin order and receipt list (admin token required)

### Stripe test checkout setup

1. Add Stripe **test mode** credentials to the ignored root `.env`: `STRIPE_SECRET_KEY=sk_test_...` and `STRIPE_WEBHOOK_SECRET=whsec_...`. Set `STRIPE_CURRENCY` (defaults to `usd`) and `SHOP_URL` if the shop is hosted at another local URL.
2. Install the official Stripe CLI separately and run `stripe listen --forward-to localhost:5000/api/payments/webhook`; put the displayed `whsec_...` in `.env` and restart the backend.
3. Rebuild/restart Compose with `docker compose up -d --build backend frontend frontend-admin` and test using Stripe's documented test card `4242 4242 4242 4242` with any future expiry and any CVC.
4. Paid orders appear under Admin → Pedidos. Paid rental lines also appear under Alquileres. Expired sessions release their stock reservation; the printed receipt is an internal, non-fiscal record.

Checkout is deliberately restricted to `sk_test_` keys in this implementation. Stripe account onboarding and live payment availability depend on Stripe-supported business locations and are not enabled here.

### Customer Management
- `GET /api/customers` - List all customers (admin token required)
- `POST /api/customers` - Create customer (admin token required)
- `PUT /api/customers/:id` - Update customer (admin token required)
- `DELETE /api/customers/:id` - Delete customer (admin token required)

### Rental Management
- `GET /api/rentals` - List all rentals (admin token required)
- `POST /api/rentals` - Create rental (admin token required)
- `PUT /api/rentals/:id/return` - Return a rental and restore stock (admin token required)
- `PUT /api/rentals/:id/payment` - Toggle payment status (admin token required)

## 🔮 Future Roadmap

🛒 **Shopping Cart** - Complete cart management for sales and rentals

💳 **Payment Gateway** - Integration with Cardnet for secure transactions

📅 **Enhanced Rental System** - Advanced tracking with due dates and late fees

🔐 **User Authentication** - Customer accounts with order history and wishlist

☁️ **Cloud Deployment** - Production build optimization for web hosting

📊 **Analytics Dashboard** - Sales reports, rental statistics, and inventory insights

## 👤 Author

**Luis Daniel Santana Mercado**

- **GitHub**: [@luida01](https://github.com/luida01)
- **Email**: luisdanielsantanamercado@gmail.com

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
If you want to contribute to this project, please feel free to contact me.

---
⭐ Built with passion for Manga and Code.
