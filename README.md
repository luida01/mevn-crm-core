# 📚 Manga Store & Rental Platform

A modern, full-stack MEVN application for managing a manga store inventory, rentals, and sales. Built with a premium UI and powerful external API integrations.

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 📋 Features

✅ **Hybrid Inventory System**
Import metadata from MyAnimeList (Jikan) and high-quality covers from MangaDex.

✅ **Volume Management**
Track individual manga volumes with specific covers and stock.

✅ **Smart Search**
Intelligent filtering to find exact series matches and avoid spin-offs.

✅ **Premium UI**
Responsive grid layout, immersive details modal, and dynamic status indicators.

✅ **Stock Control**
Visual "In Stock" / "Out of Stock" tracking with automated button states.

✅ **Interactive Modal**
Rich details view with synopsis, genres, and full-size cover display.

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

- **Frontend**: Vue 3, Vite, TailwindCSS, Pinia, TypeScript
- **Backend**: Node.js, Express, Mongoose, TypeScript
- **Database**: MongoDB
- **APIs**: Jikan (Metadata), MangaDex (Covers)

## 🔮 Future Roadmap

The project is currently in active development. The following features are planned for the next release:

🛒 **Shopping Cart**
Complete cart management for sales and rentals.

💳 **Payment Gateway**
Integration with Cardnet for secure transactions.

📅 **Rental System**
Tracking due dates, late fees, and rental history.

🔐 **User Accounts**
Customer profiles and order history.

☁️ **Cloud Deployment**
Production build optimization for web hosting.

## 👤 Author

**Luis Daniel Santana Mercado**

- **GitHub**: [@luida01](https://github.com/luida01)
- **Email**: luisdanielsantanamercado@gmail.com

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
If you want to contribute to this project, please feel free to contact me.

---
⭐ Built with passion for Manga and Code.
