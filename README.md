# MangaGo

Plataforma para explorar un catálogo de manga por volumen, gestionar una tienda y organizar alquileres desde un panel administrativo.

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

## Aplicación en producción

| Módulo | Enlace |
| --- | --- |
| Tienda | [mangago-shop.vercel.app](https://mangago-shop.vercel.app) |
| Panel administrativo | [mangago-admin.vercel.app](https://mangago-admin.vercel.app) |
| API | [mangago-api.vercel.app](https://mangago-api.vercel.app) |
| Estado de la API y MongoDB | [health/ready](https://mangago-api.vercel.app/health/ready) |
| Estado del checkout de prueba | [checkout/config](https://mangago-api.vercel.app/api/checkout/config) |

El panel administrativo no permite crear una cuenta pública. Para solicitar acceso, escribe a [luisdanielsantanamercado@gmail.com](mailto:luisdanielsantanamercado@gmail.com). Las credenciales se entregan de forma privada; no están incluidas en este repositorio.

## Qué incluye

### Tienda

- Catálogo público con búsqueda, filtros por autor, título, volumen y disponibilidad.
- Inventario y precios independientes para cada volumen.
- Portadas específicas por volumen. La API las obtiene a través de un proxy con caché temporal y muestra una alternativa cuando la portada no está disponible.
- Colecciones temáticas, novedades, autores destacados y selecciones de lectores.
- Carrito combinado para compras y alquileres.
- Checkout de Stripe en **modo de prueba**. El backend valida precios y disponibilidad, reserva unidades temporalmente y procesa los eventos firmados del webhook.

### Panel administrativo

- Administración de mangas, volúmenes, precios y existencias.
- Registro de clientes y seguimiento de alquileres, vencimientos, devoluciones y pagos.
- Pedidos de la tienda, estado del pago y comprobantes internos imprimibles.
- Configuración de los datos del negocio y de los días sugeridos para alquileres.

Los comprobantes son registros internos; no son facturas fiscales. El checkout está en modo de prueba y no procesa cobros reales.

## Arquitectura

| Aplicación | Carpeta | Tecnologías |
| --- | --- | --- |
| API REST | `backend` | Node.js, Express, TypeScript, Mongoose |
| Tienda | `frontend` | Vue 3, Vite, Pinia, Vue Router |
| Panel administrativo | `frontend-admin` | Vue 3, Vite, Pinia, Vue Router |
| Base de datos | — | MongoDB |

La información editorial de una serie se guarda una sola vez en `MangaSeries`. Cada documento `Manga` representa un volumen con su propio número, portada, precio y stock. Las ventas y alquileres actualizan las unidades disponibles; las reservas de checkout vencidas liberan el stock.

La tienda obtiene metadatos editoriales de MyAnimeList mediante Jikan y portadas de MangaDex. Las portadas se sirven desde la API del proyecto.

## Empezar en local

### Requisitos

- Node.js y npm.
- Docker Compose, o una instancia de MongoDB local accesible en el puerto `27017`.

### Opción recomendada: Docker Compose

Desde la raíz del repositorio:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y reemplaza los valores de ejemplo de `JWT_SECRET` y `ADMIN_PASSWORD` por valores propios. Luego inicia los servicios:

```powershell
docker compose up --build
```

Al iniciar:

- Tienda: [http://localhost:5173](http://localhost:5173)
- Panel: [http://localhost:5174/login](http://localhost:5174/login)
- API: [http://localhost:5000](http://localhost:5000)
- Bandeja local de correo (Mailpit): [http://localhost:8025](http://localhost:8025)

Docker Compose inicia MongoDB, la API y ambas aplicaciones web. Los datos de MongoDB se conservan en el volumen `mongo-data`. Mailpit captura los correos localmente y no los envía a destinatarios externos.

### Ejecución sin Docker

Inicia MongoDB en el puerto `27017` y configura `backend/.env` con, al menos:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mevn-crm
JWT_SECRET=un-secreto-aleatorio-de-al-menos-32-caracteres
ADMIN_USERNAME=admin
ADMIN_PASSWORD=una-clave-de-al-menos-12-caracteres
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

En tres terminales, instala dependencias e inicia cada módulo:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

```bash
cd frontend-admin
npm install
npm run dev
```

La tienda y el panel usan por defecto `http://localhost:5000/api`. Si la API está en otra dirección, configura `VITE_API_URL` en el módulo correspondiente. Para que el enlace del panel vuelva a la tienda, configura `VITE_SHOP_URL` en `frontend-admin`.

## Variables de entorno

No agregues archivos `.env` ni secretos al control de versiones. Para producción, las variables se configuran en Vercel y las credenciales de base de datos en el proveedor de MongoDB.

| Variable | Uso |
| --- | --- |
| `MONGODB_URI` | Conexión a MongoDB. |
| `JWT_SECRET` | Firma de sesiones administrativas; usa al menos 32 caracteres aleatorios. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Credenciales del panel; usa una clave única de al menos 12 caracteres. |
| `CORS_ORIGINS` | Orígenes exactos permitidos para la tienda y el panel. |
| `VITE_API_URL` | URL pública de la API para los frontends, incluyendo `/api`. |
| `VITE_SHOP_URL` | URL de la tienda que enlaza el panel administrativo. |
| `SHOP_URL` | URL de la tienda usada en enlaces de checkout y avisos. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Claves de Stripe de prueba y secreto de firma del webhook. |
| `STRIPE_CURRENCY` | Moneda del checkout; por defecto `usd`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Envío de comprobantes y avisos de stock por correo. |
| `CRON_SECRET` | Protección de la ruta del proceso programado de avisos de stock. |

La [guía de despliegue](./DEPLOYMENT.md) documenta la configuración de los tres proyectos de Vercel, CORS, MongoDB y tareas de correo. El checkout solo acepta claves de Stripe de prueba (`sk_test_` o `rk_test_`).

## API

La API usa rutas públicas para la tienda y rutas administrativas protegidas con JWT.

| Ruta | Descripción |
| --- | --- |
| `GET /health/live` | Comprueba que el proceso de API responde. |
| `GET /health/ready` | Comprueba que API y MongoDB están disponibles. |
| `GET /api/shop/catalog` | Catálogo público paginado con búsqueda y filtros. |
| `GET /api/shop/collections/:theme` | Colección temática: `beginner`, `anime-adaptations` o `horror`. |
| `GET /api/shop/top-rated`, `recent`, `top-authors` | Recomendaciones, novedades y autores destacados. |
| `POST /api/auth/login` | Inicio de sesión del panel administrativo. |
| `GET/POST/PUT/DELETE /api/mangas` | Consulta y mantenimiento de inventario. |
| `GET/POST/PUT/DELETE /api/customers` | Gestión de clientes. |
| `GET/POST /api/rentals` | Registro y consulta de alquileres. |
| `GET/POST /api/invoices` | Comprobantes internos de alquiler. |
| `GET/PUT /api/settings` | Datos del negocio y días sugeridos de alquiler. |
| `GET/POST /api/checkout/*` | Configuración, creación y confirmación de sesiones de checkout. |
| `POST /api/payments/webhook` | Eventos de Stripe verificados con firma. |

## Stripe en modo de prueba

El entorno de producción está configurado para probar Stripe con claves de prueba. No se realizan cobros reales. Para probar el checkout, usa la tarjeta de prueba `4242 4242 4242 4242`, una fecha futura y cualquier CVC. Consulta las [tarjetas de prueba de Stripe](https://docs.stripe.com/testing?numbers-or-method-or-token=tokens).

Webhook configurado para el entorno de prueba:

```
https://mangago-api.vercel.app/api/payments/webhook
```

No publiques `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET`. Para desarrollo local, usa Stripe CLI para reenviar eventos al webhook local y guarda el `whsec_...` local en un archivo `.env` ignorado por Git.

## Desarrollo y comprobaciones

Desde cada módulo puedes compilar la aplicación:

```bash
npm --prefix backend run build
npm --prefix frontend run build
npm --prefix frontend-admin run build
```

Comprobaciones disponibles:

- `cd backend && npm run check:workflows`: flujos de API con MongoDB temporal; requiere MongoDB local en el puerto `27017` o configurar `TEST_MONGODB_URI`.
- `cd frontend && npm run test:e2e`: flujos de navegador con Playwright; requiere instalar Chromium con `npx playwright install chromium`.

## Repositorio y contacto

- Código fuente: [github.com/luida01/mevn-crm-core](https://github.com/luida01/mevn-crm-core)
- Autor: [Luis Daniel Santana Mercado](https://github.com/luida01)
- Consultas y solicitudes de acceso al panel: [luisdanielsantanamercado@gmail.com](mailto:luisdanielsantanamercado@gmail.com)
