# MangaGo

**A manga shop and rental platform built to help readers discover their next series and help store teams keep every volume, customer, and rental organized.**

[![Vue.js](https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Pinia](https://img.shields.io/badge/Pinia-3-fada5e?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

## Live demo

| Experience | Link |
| --- | --- |
| MangaGo storefront | [mangago-shop.vercel.app](https://mangago-shop.vercel.app) |
| Admin workspace | [mangago-admin.vercel.app](https://mangago-admin.vercel.app) |
| API and database health | [mangago-api.vercel.app/health/ready](https://mangago-api.vercel.app/health/ready) |
| Stripe test checkout status | [mangago-api.vercel.app/api/checkout/config](https://mangago-api.vercel.app/api/checkout/config) |

**Admin access:** the admin panel is private and has no public sign-up. To request access to the demo, email [luisdanielsantanamercado@gmail.com](mailto:luisdanielsantanamercado@gmail.com). Login details are provided privately and are never stored in this repository.

## About MangaGo

MangaGo connects the public experience of finding and reading manga with the everyday operations of a manga shop. Readers can browse series, check a specific volume's availability, compare buying and renting, and complete a mixed cart in one visit. Store staff use a separate admin workspace to keep inventory, customer records, rentals, returns, and online orders in order.

The catalog is organized around **physical volumes**, not just series. A series can contain many volumes, and each volume can have its own cover, price, rental rate, and stock. This distinction helps readers find the exact book they want and helps staff see what is actually on the shelf.

The project is designed as a complete, connected product: the storefront, admin panel, API, and database work together. The hosted version is also a portfolio demo where visitors can explore the shop and try checkout in Stripe's test environment.

## The reader experience

The storefront is designed to make exploring the catalog feel simple and welcoming:

- Search and browse by title, author, genre, volume, and availability.
- Find new ideas through themed collections, recent arrivals, popular authors, and reader favorites.
- Open a manga to read its description, publication details, and available volumes.
- See a cover for each volume, served through MangaGo's cover service with a fallback when an image is unavailable.
- Add purchases and rentals to one cart and review the total before checkout.

## The store team's workspace

The admin panel brings the store's daily tasks together:

- Add and update manga series and their individual volumes.
- Set purchase prices, rental rates, and stock for each volume.
- Keep customer details and rental history together.
- Review active, returned, and overdue rentals; record returns and payments.
- Track online orders and print internal order receipts.
- Set business contact details and suggested rental periods.

Receipts are internal records of a sale or rental. They are **not tax invoices**.

## How buying and renting work

The shop supports both purchases and rentals in the same cart. When a reader begins Stripe Checkout, the API checks the current prices and available stock and temporarily reserves the requested volumes. A signed Stripe event confirms a successful test payment, updates the order, and creates rental records for rented items. If checkout expires, the reserved stock is released.

The hosted application uses **Stripe test mode only**. It does not accept live payments or charge real cards. For an interactive checkout demo, use Stripe's [test card details](https://docs.stripe.com/testing?numbers-or-method-or-token=tokens), including `4242 4242 4242 4242` with a future expiry date and any CVC.

## Manga information and covers

Series information is stored once and reused for every volume. MangaGo can retrieve manga metadata through Jikan, which provides access to MyAnimeList data. Volume covers come from MangaDex and are requested through the backend cover service, where they can be cached temporarily and served with the correct cross-origin headers. If a cover cannot be loaded, the storefront shows its built-in fallback image.

## Technology at a glance

| Part | Technology | What it does |
| --- | --- | --- |
| Storefront | Vue 3, TypeScript, Vite, Pinia | Public catalog, shopping cart, checkout, and reader pages |
| Admin panel | Vue 3, TypeScript, Vite, Pinia | Private inventory and customer management workspace |
| API | Node.js, Express, TypeScript | Catalog, stock, rentals, orders, authentication, and payments |
| Data | MongoDB with Mongoose | Series, volumes, customers, rentals, and orders |
| Hosting | Vercel | Separate deployments for the storefront, admin panel, and API |
| Local environment | Docker Compose | Runs the two apps, API, database, and local email preview together |

## Project layout

```text
mevn-crm-core/
├── backend/        API, database models, routes, and business logic
├── frontend/       Customer storefront
├── frontend-admin/ Private admin panel
├── docs/           Project and cover-service documentation
├── docker-compose.yml
└── README.md
```

## Run it locally

### Requirements

- Docker Desktop with Docker Compose.
- Git, if you want to clone the repository.

### Start the full app

Clone the repository and move into the project folder:

```bash
git clone https://github.com/luida01/mevn-crm-core.git
cd mevn-crm-core
```

Create a local environment file and set your own private values for `JWT_SECRET` and `ADMIN_PASSWORD`:

```powershell
Copy-Item .env.example .env
```

Then start the services:

```bash
docker compose up --build
```

Open the local apps:

| App | Local address |
| --- | --- |
| Storefront | [http://localhost:5173](http://localhost:5173) |
| Admin panel | [http://localhost:5174/login](http://localhost:5174/login) |
| API | [http://localhost:5000](http://localhost:5000) |
| Email preview | [http://localhost:8025](http://localhost:8025) |

The local email preview captures messages for development and does not send them to real inboxes. MongoDB data is kept in the Docker volume named `mongo-data`.

### Run the apps without Docker

You can also run the apps separately if you already have MongoDB available on port `27017`. Configure `backend/.env` with a database URL, JWT secret, admin username and password, and the local storefront/admin origins. Then install dependencies and start each module in its own terminal:

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

The frontends use `http://localhost:5000/api` by default. For a different API address, set `VITE_API_URL` in the relevant frontend environment. To make the admin panel link to your local store, set `VITE_SHOP_URL` in `frontend-admin`.

## Useful API links

The API serves the storefront and admin panel. These public routes are useful for checking the live demo:

- `GET /health/live` and `GET /health/ready` — service and database status.
- `GET /api/shop/catalog` — searchable, paginated storefront catalog.
- `GET /api/shop/collections/:theme` — themed manga collections.
- `GET /api/shop/recent` and `GET /api/shop/top-rated` — new and popular titles.
- `GET /api/checkout/config` — whether test checkout is ready.
- `POST /api/payments/webhook` — signed Stripe test events.

Admin routes require a valid login. The API does not expose admin credentials in public responses.

## Checks for contributors

Each app has a production build command:

```bash
npm --prefix backend run build
npm --prefix frontend run build
npm --prefix frontend-admin run build
```

Additional checks are available:

- `cd backend && npm run check:workflows` runs API workflows against a temporary MongoDB database. It requires MongoDB on port `27017`, or a separate `TEST_MONGODB_URI`.
- `cd frontend && npm run test:e2e` runs storefront and admin browser flows with Playwright. Install Chromium first with `npx playwright install chromium`.

For deployment setup, hosted environment variables, and the stock-alert email worker, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Security and demo notes

- Never commit `.env` files, admin passwords, database credentials, or Stripe secrets.
- The admin panel is protected by authentication; access is shared privately.
- Stripe is configured in test mode. A successful demo checkout is not a real-world payment.
- Email sent by local Docker goes to Mailpit, not to external recipients.
- The shop includes public catalog and availability data; production credentials and private operations stay on the API.

## Project links

- Source code: [github.com/luida01/mevn-crm-core](https://github.com/luida01/mevn-crm-core)
- Author: [Luis Daniel Santana Mercado](https://github.com/luida01)
- Questions and admin access: [luisdanielsantanamercado@gmail.com](mailto:luisdanielsantanamercado@gmail.com)
