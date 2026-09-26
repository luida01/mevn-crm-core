# MangaGo

**A manga shop and rental platform that helps readers find their next series and gives store staff one place to manage the collection.**

[Open the store](https://mangago-shop.vercel.app) · [Open the admin panel](https://mangago-admin.vercel.app) · [Check service status](https://mangago-api.vercel.app/health/ready)

## About the project

MangaGo brings the reader experience and the day-to-day work of running a manga shop together. Readers can explore a catalog by title, author, genre, and volume, then choose whether to buy or rent what they find. Store staff can manage the same collection from a private workspace, with tools for inventory, customers, rentals, returns, and orders.

The catalog is organized at the **individual volume** level. A series can have many volumes, and each one can have its own cover, price, and stock count. This makes it easier to answer the questions that matter in a real shop: which volume is available, what does it cost, and can it be rented?

MangaGo is designed to make manga discovery feel inviting while keeping the business side clear and dependable. Its live deployment is also a working portfolio demo: the storefront, admin panel, API, catalog, and checkout flow are all connected.

## For readers

- Browse and search the catalog, with filters for titles, authors, volumes, and availability.
- Explore themed collections, recent arrivals, popular creators, and reader favorites.
- View series details and volume-specific cover art.
- Add purchases and rentals to one cart.
- Follow a guided checkout that reserves available stock while the order is completed.

## For store staff

The private admin panel provides a practical workspace to:

- Add and update series, volumes, prices, covers, and inventory.
- Keep customer contact details and rental history together.
- Track active rentals, due dates, returns, and payments.
- Review online orders and print internal order receipts.
- Update business details and suggested rental periods.

Receipts in the system are internal order records, not tax invoices. The admin panel does not offer public self-registration.

## Live demo

| Part of MangaGo | Link |
| --- | --- |
| Customer storefront | [mangago-shop.vercel.app](https://mangago-shop.vercel.app) |
| Admin workspace | [mangago-admin.vercel.app](https://mangago-admin.vercel.app) |
| Service and database status | [mangago-api.vercel.app/health/ready](https://mangago-api.vercel.app/health/ready) |

**Want to try the admin panel?** Email [luisdanielsantanamercado@gmail.com](mailto:luisdanielsantanamercado@gmail.com) to request access. Login details are shared privately and are not stored in this repository.

### Payments in the demo

Checkout is connected to Stripe in **test mode only**. You can try the purchase flow, but it will not charge a real card. Use Stripe’s [test card details](https://docs.stripe.com/testing?numbers-or-method-or-token=tokens) when prompted. The production demo is not configured to accept live payments.

## How MangaGo is put together

MangaGo has three connected parts:

- **The store** is the public website readers use to browse and shop.
- **The admin panel** is the private workspace staff use to manage the business.
- **The API and database** keep catalog, stock, customer, rental, and order information in sync.

The project uses Vue for the two web apps, Node.js and Express for the API, and MongoDB for data storage. Series information is enriched with manga metadata, and covers are served through the API so the store can handle temporary image caching and unavailable covers consistently.

## Run MangaGo on your computer

The quickest way to start the full application is with Docker Compose. You’ll need Docker Desktop.

1. From the project folder, copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` and replace the example `JWT_SECRET` and `ADMIN_PASSWORD` with your own private values.
3. Start the application:

   ```powershell
   docker compose up --build
   ```

Then open:

- Store: [localhost:5173](http://localhost:5173)
- Admin panel: [localhost:5174/login](http://localhost:5174/login)
- Local email preview: [localhost:8025](http://localhost:8025)

The local email preview captures messages for development; it does not send them to real inboxes. For more deployment and configuration details, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project links

- Source code: [github.com/luida01/mevn-crm-core](https://github.com/luida01/mevn-crm-core)
- Author: [Luis Daniel Santana Mercado](https://github.com/luida01)
- Questions or admin access: [luisdanielsantanamercado@gmail.com](mailto:luisdanielsantanamercado@gmail.com)
