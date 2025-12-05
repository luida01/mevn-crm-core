# 📚 Manga Store & Rental Platform

A modern, full-stack MEVN application for managing a manga store inventory, rentals, and sales. Built with a premium UI and powerful external API integrations.

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🌟 Overview

This project is a **comprehensive manga management platform** that combines:
- 🏢 **CRM System**: Complete administrative panel for inventory, customers, and rental management
- 🛍️ **E-commerce Portal**: Customer-facing shop with curated collections and premium UI
- 🔗 **External API Integration**: MyAnimeList (Jikan) for metadata and MangaDex for high-quality covers
- 📦 **Volume-Level Tracking**: Individual volume management with specific covers and stock control

## 📋 Key Features

### 🎯 Core Functionality

✅ **Hybrid Inventory System**
- Import metadata from MyAnimeList (Jikan API)
- Fetch high-quality volume-specific covers from MangaDex
- Intelligent search with spin-off filtering

✅ **Dual Interface**
- **Admin Panel**: Complete CRM for managing inventory, customers, and rentals
- **Shop Portal**: Customer-facing e-commerce with curated collections

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
- Docker & Docker Compose (optional, for DB)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mevn-crm
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with MONGODB_URI
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Docker (Alternative)**
   ```bash
   docker-compose up --build
   ```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5.1.0
- **Database**: MongoDB 9.0.0 with Mongoose ODM
- **External APIs**:
  - **Jikan API**: MyAnimeList metadata (title, author, genre, score, status)
  - **MangaDex API**: High-quality volume-specific cover images
- **Tools**: Axios, CORS, dotenv

### Frontend
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
  - Frontend Dev Server (port 5173)

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

### Manga Management
- `GET /api/mangas` - List all manga
- `GET /api/mangas/:id` - Get specific manga
- `POST /api/mangas` - Create new manga
- `PUT /api/mangas/:id` - Update manga
- `DELETE /api/mangas/:id` - Delete manga
- `GET /api/mangas/search?q=query` - Search local inventory
- `GET /api/mangas/search-remote?q=query` - Search MyAnimeList
- `GET /api/mangas/cover?title=X&volume=Y` - Fetch MangaDex cover

### Shop (E-commerce)
- `GET /api/shop/top-rated?limit=10` - Top-rated manga (MAL ≥ 7.5)
- `GET /api/shop/recent-arrivals?limit=6` - Recent additions
- `GET /api/shop/collections/:theme` - Thematic collections
- `GET /api/shop/authors/:author` - Manga by author
- `GET /api/shop/top-authors?limit=6` - Popular authors
- `GET /api/shop/most-read-week` - Weekly rankings
- `GET /api/shop/most-rented-today` - Daily rental rankings

### Customer Management
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Rental Management
- `GET /api/rentals` - List all rentals
- `POST /api/rentals` - Create rental
- `PUT /api/rentals/:id` - Update rental status
- `DELETE /api/rentals/:id` - Delete rental

## 📈 Current Development Status

**Latest Commits**:
- `a9fee02` - docs: improved README and MEVN stack setup with Docker (8 days ago)
- `50b5363` - Initial commit: Project setup (8 days ago)

**Pending Changes**: 20 files modified with 657 additions and 318 deletions

**Key Areas of Active Development**:
- ✨ Enhanced customer list view with rental information
- 🎨 Improved manga details modal and edit functionality
- 🛍️ E-commerce shop view with curated collections
- 📊 Rental information section with tracking
- 🐳 Docker configuration optimization

## 🔮 Future Roadmap

The project is currently in active development. The following features are planned for future releases:

🛒 **Shopping Cart**
Complete cart management for sales and rentals.

💳 **Payment Gateway**
Integration with Cardnet for secure transactions.

📅 **Enhanced Rental System**
Advanced tracking with due dates, late fees, and detailed rental history.

🔐 **User Authentication**
Customer accounts with order history and wishlist.

☁️ **Cloud Deployment**
Production build optimization for web hosting.

📊 **Analytics Dashboard**
Sales reports, rental statistics, and inventory insights.

## 👤 Author

**Luis Daniel Santana Mercado**

- **GitHub**: [@luida01](https://github.com/luida01)
- **Email**: luisdanielsantanamercado@gmail.com

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
If you want to contribute to this project, please feel free to contact me.

---
⭐ Built with passion for Manga and Code.
