# 📊 Análisis del Repositorio MEVN CRM Manga

## 🔗 Información del Repositorio

- **URL**: https://github.com/luida01/mevn-crm-core.git
- **Nombre**: mevn-crm-core
- **Autor**: Luis Daniel Santana Mercado (@luida01)
- **Descripción**: Plataforma completa de gestión y venta/alquiler de manga con stack MEVN

---

## 📈 Estado Actual del Proyecto

### Commits Recientes
- `a9fee02` - docs: improved README and MEVN stack setup with Docker (hace 8 días)
- `50b5363` - Initial commit: Project setup (hace 8 días)

### Cambios Pendientes de Commit
**20 archivos modificados** con **657 inserciones(+)** y **318 eliminaciones(-)**

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Backend
- **Runtime**: Node.js con TypeScript
- **Framework**: Express 5.1.0
- **Base de Datos**: MongoDB 9.0.0 con Mongoose
- **APIs Externas**: 
  - Jikan API (MyAnimeList) - Metadatos de manga
  - MangaDex API - Portadas de alta calidad
- **Herramientas**: Axios, CORS, dotenv
- **Dev Tools**: ts-node, nodemon

#### Frontend
- **Framework**: Vue 3.5.24
- **Build Tool**: Vite 7.2.4
- **State Management**: Pinia 3.0.4
- **Routing**: Vue Router 4.6.3
- **Styling**: TailwindCSS 3.4.17
- **Lenguaje**: TypeScript 5.9.3

#### Infraestructura
- **Containerización**: Docker + Docker Compose
- **Servicios**:
  - MongoDB (puerto 27017)
  - Backend (puerto 5000)
  - Frontend (puerto 5173)

---

## 📦 Modelos de Datos

### 1. **Manga** (`backend/src/models/Manga.ts`)
```typescript
{
  title: string           // Título del manga
  volume: number          // Número de volumen
  author: string          // Autor
  genre: string           // Género
  isbn?: string           // ISBN (opcional)
  price: number           // Precio de venta
  rentalPrice: number     // Precio de alquiler
  stock: number           // Cantidad en inventario
  coverImage?: string     // URL de portada
  description?: string    // Sinopsis
  publishedYear?: number  // Año de publicación
  status?: string         // Estado: "Finished", "Publishing"
  malScore?: number       // Puntuación MAL (0-10)
  malId?: string          // ID de MyAnimeList
  createdAt: Date         // Fecha de creación
}
```

**Características**:
- Índice de búsqueda de texto en `title`, `author`, `genre`
- Integración con MyAnimeList para metadatos
- Soporte para portadas de MangaDex

### 2. **Customer** (`backend/src/models/Customer.ts`)
```typescript
{
  firstName: string
  lastName: string
  email: string (único)
  password?: string       // Hash de contraseña
  phone?: string
  isActive: boolean
  address: {
    street: string
    city: string
    zip: string
  }
  createdAt: Date
}
```

**Características**:
- Virtual field `rentals` (relación con modelo Rental)
- Email único para cada cliente
- Sistema de activación/desactivación

### 3. **Rental** (`backend/src/models/Rental.ts`)
```typescript
{
  customer: ObjectId      // Referencia a Customer
  manga: ObjectId         // Referencia a Manga
  startDate: Date
  dueDate: Date
  returnDate?: Date
  status: 'ACTIVE' | 'RETURNED' | 'LATE'
  cost: number
  isPaid: boolean
}
```

**Características**:
- Sistema de estados para tracking de alquileres
- Cálculo de costos
- Control de pagos

---

## 🎯 Controladores y APIs

### 1. **mangaController.ts** (12.7 KB)
**Endpoints principales**:
- `GET /api/mangas` - Listar todos los mangas
- `GET /api/mangas/:id` - Obtener manga específico
- `POST /api/mangas` - Crear manga
- `PUT /api/mangas/:id` - Actualizar manga
- `DELETE /api/mangas/:id` - Eliminar manga
- `GET /api/mangas/search` - Búsqueda local
- `GET /api/mangas/search-remote` - Búsqueda en Jikan API
- `GET /api/mangas/cover` - Obtener portada de MangaDex

**Características destacadas**:
- Búsqueda inteligente en MyAnimeList con filtros para evitar spin-offs
- Paginación automática para obtener todas las portadas de MangaDex
- Sistema de búsqueda por autor y volumen específico
- Integración completa con APIs externas

### 2. **shopController.ts** (6.9 KB)
**Endpoints para e-commerce**:
- `GET /api/shop/top-rated` - Top mangas (MAL score >= 7.5)
- `GET /api/shop/recent-arrivals` - Últimos 30 días
- `GET /api/shop/collections/:theme` - Colecciones temáticas
- `GET /api/shop/authors/:author` - Mangas por autor
- `GET /api/shop/top-authors` - Autores más populares
- `GET /api/shop/most-read-week` - Más leídos (placeholder)
- `GET /api/shop/most-rented-today` - Más alquilados (placeholder)

**Características destacadas**:
- Sistema de caché (5 minutos) para optimizar rendimiento
- Colecciones temáticas: beginner, anime-adaptations, horror
- Agregaciones de MongoDB para estadísticas de autores
- Filtros inteligentes por stock, puntuación y fecha

### 3. **customerController.ts** (2.5 KB)
CRUD completo para gestión de clientes

### 4. **rentalController.ts** (3.0 KB)
Gestión de alquileres con tracking de estados

---

## 🎨 Componentes Frontend

### Vistas Principales (5)
1. **DashboardView.vue** - Panel de administración
2. **MangaListView.vue** (10.3 KB) - Gestión de inventario
3. **CustomersView.vue** - Gestión de clientes
4. **RentalsView.vue** (5.3 KB) - Gestión de alquileres
5. **ShopView.vue** (10.6 KB) - Portal de e-commerce

### Componentes (12)
1. **MangaForm.vue** (6.8 KB) - Formulario con búsqueda MAL
2. **MangaImportModal.vue** (3.6 KB) - Importación desde APIs
3. **MangaDetailsModal.vue** (3.2 KB) - Vista detallada
4. **MangaEditModal.vue** (2.3 KB) - Edición rápida
5. **MangaCarousel.vue** (5.3 KB) - Carrusel de productos
6. **ThematicCollection.vue** (2.5 KB) - Colecciones temáticas
7. **CustomerForm.vue** (6.1 KB) - Formulario de clientes
8. **CustomerList.vue** (5.2 KB) - Lista de clientes
9. **RentalForm.vue** (4.0 KB) - Formulario de alquileres
10. **RentalInfoSection.vue** (4.3 KB) - Información de alquileres
11. **ShopFooter.vue** (5.8 KB) - Footer del e-commerce
12. **HelloWorld.vue** (0.9 KB) - Componente de ejemplo

---

## 🌟 Características Más Relevantes

### 1. **Sistema Híbrido de Inventario**
- Importación automática de metadatos desde MyAnimeList (Jikan API)
- Portadas de alta calidad desde MangaDex
- Búsqueda inteligente que filtra spin-offs y encuentra series exactas

### 2. **Gestión de Volúmenes**
- Tracking individual de volúmenes con portadas específicas
- Control de stock por volumen
- Sistema de precios diferenciados (venta vs alquiler)

### 3. **Dual Interface**
- **CRM**: Panel de administración completo para gestión interna
- **E-commerce**: Portal público para clientes con diseño premium

### 4. **Colecciones Inteligentes**
- **Trending Now**: Top rated (MAL score >= 7.5)
- **Recent Arrivals**: Últimos 6 items agregados
- **Thematic Collections**: Beginner-friendly, Anime Adaptations, Horror
- **Author Collections**: Agrupación por autores populares
- **Community Reads**: Most Read This Week, Most Rented Today

### 5. **UI Premium**
- Grid layout responsivo con TailwindCSS
- Modal inmersivo para detalles de manga
- Indicadores dinámicos de estado (In Stock / Out of Stock)
- Carruseles interactivos
- Diseño moderno y atractivo

### 6. **Integración de APIs Externas**
- **Jikan API**: Búsqueda y metadatos de MyAnimeList
- **MangaDex API**: Portadas de alta resolución por volumen
- Sistema de caché para optimizar llamadas

---

## 📊 Cambios Más Relevantes (Sin Commit)

### Backend
1. **Dockerfile** - Configuración de contenedor
2. **mangaController.ts** - Lógica de búsqueda y APIs externas

### Frontend
1. **CustomerList.vue** - Visualización mejorada de clientes
2. **MangaDetailsModal.vue** - Modal de detalles
3. **MangaListView.vue** - Vista de gestión de inventario
4. **ShopView.vue** - Portal de e-commerce
5. **RentalInfoSection.vue** - Sección de información de alquileres

**Total**: 20 archivos con 657 líneas agregadas y 318 eliminadas

---

## 🚀 Roadmap Futuro

### Características Planificadas
- 🛒 **Shopping Cart**: Gestión completa de carrito para ventas y alquileres
- 💳 **Payment Gateway**: Integración con Cardnet para transacciones seguras
- 📅 **Rental System**: Tracking de fechas de vencimiento, multas por retraso, historial
- 🔐 **User Accounts**: Perfiles de clientes y historial de órdenes
- ☁️ **Cloud Deployment**: Optimización para producción y hosting web

---

## 🛠️ Instalación y Uso

### Opción 1: Docker (Recomendado)
```bash
git clone https://github.com/luida01/mevn-crm-core.git
cd mevn-crm-core
docker-compose up --build
```

### Opción 2: Manual
```bash
# Backend
cd backend
npm install
# Crear archivo .env con MONGODB_URI
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Puertos
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

---

## 📝 Conclusión

Este proyecto representa una **plataforma completa de gestión de manga** con:
- ✅ Stack moderno MEVN (MongoDB, Express, Vue, Node)
- ✅ Integración con APIs externas (MyAnimeList, MangaDex)
- ✅ Dual interface (CRM + E-commerce)
- ✅ Sistema de alquileres y ventas
- ✅ UI premium y responsiva
- ✅ Containerización con Docker
- ✅ TypeScript en todo el stack

El repositorio está en **desarrollo activo** con cambios significativos pendientes de commit que mejoran la funcionalidad del sistema de gestión de clientes, visualización de inventario y portal de e-commerce.
