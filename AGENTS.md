# AGENTS.md - Guía rápida del proyecto

## Resumen
`mevn-crm-manga` es una app MEVN con arquitectura de 3 módulos:
- `backend`: API REST (Node.js + Express + TypeScript + Mongoose)
- `frontend`: tienda para clientes (Vue 3 + Vite + Pinia)
- `frontend-admin`: panel CRM administrativo (Vue 3 + Vite + Pinia)

## Estructura
- `backend/src/models`: `Manga`, `Customer`, `Rental`, `Invoice`, `BusinessSettings`
- `backend/src/controllers`: lógica de negocio por dominio
- `backend/src/routes`: rutas `/api/mangas`, `/api/customers`, `/api/rentals`, `/api/shop`
- `frontend/src` y `frontend-admin/src`: `views`, `components`, `stores`, `services/api.ts`, `router`

## Flujo backend
Rutas -> Controladores -> Modelos -> MongoDB

Endpoints principales:
- `GET/POST/PUT/DELETE /api/mangas`
- `GET/POST/PUT/DELETE /api/customers`
- `GET/POST /api/rentals`, `PUT /api/rentals/:id/return`, `PUT /api/rentals/:id/payment`
- `PUT /api/mangas/:id/stock`: incrementa stock con una cantidad entera positiva.
- `GET /api/shop/catalog`: catálogo público paginado con búsqueda y filtro de disponibilidad.
- `GET/POST /api/invoices`: comprobantes internos, uno por alquiler; no son facturas fiscales.
- `GET/PUT /api/settings`: datos del negocio y días sugeridos para nuevos alquileres.
- `GET /api/shop/top-rated`, `recent`, `collections/:theme`, `author/:author`, `top-authors`, `most-read-week`, `most-rented-today`

## Variables de entorno
- Backend (`backend/.env`):
  - `PORT` (default 5000)
  - `MONGODB_URI` (ej: `mongodb://localhost:27017/mevn-crm`)
- Frontends (`frontend/.env`, opcional en admin):
  - `VITE_API_URL` (ej: `http://localhost:5000/api`)

## Ejecución local
- Backend: `cd backend && npm install && npm run dev`
- Frontend shop: `cd frontend && npm install && npm run dev`
- Frontend admin: `cd frontend-admin && npm install && npm run dev`
- Docker (todo junto): `docker-compose up --build`

## Convenciones para trabajar en este repo
- Mantener tipado TypeScript (evitar `any` nuevo).
- Reutilizar stores/servicios existentes antes de duplicar lógica.
- Respetar separación entre tienda (`frontend`) y panel (`frontend-admin`).
- Si cambias contratos API, actualizar ambos frontends.

## Seguridad y comprobaciones
- Las rutas administrativas requieren JWT con rol admin; las credenciales y el secreto se configuran por entorno.
- CORS usa una lista de orígenes permitidos. El catálogo público no requiere autenticación.
- `cd backend && npm run check:workflows` compila y verifica los flujos contra una base MongoDB temporal que se elimina al terminar. Requiere MongoDB local en 27017; se puede indicar otro servidor con `TEST_MONGODB_URI`.
- Compilar ambos frontends con `npm run build` después de modificar contratos o pantallas.
- Los pagos de la tienda son simulados. El panel solo registra cobros que el equipo confirma haber recibido.
