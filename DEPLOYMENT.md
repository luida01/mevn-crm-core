# Vercel deployment

This repository has three Vercel projects because it contains two static Vue apps and one Express API. The MongoDB database must be hosted outside Vercel (MongoDB Atlas is suitable); the local Docker database is not accessible from production.

## Create the three projects

Connect this Git repository three times in Vercel and set each project's **Root Directory** and build settings:

| Project | Root directory | Build command | Output |
| --- | --- | --- | --- |
| API | `backend` | `npm run build` | managed by `backend/vercel.json` |
| Storefront | `frontend` | `npm run build` | `dist` |
| Admin | `frontend-admin` | `npm run build` | `dist` |

The frontend `vercel.json` files provide SPA fallback routing for Vue Router URLs.

## Environment variables

For stock notification emails, also configure SMTP and a scheduled queue worker as described in [STOCK_ALERTS.md](./STOCK_ALERTS.md). Local Docker captures messages in Mailpit; it does not deliver them to real inboxes.

Set these only in the API project's Vercel environment settings. Use separate strong production secrets; never commit `.env` files.

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Production MongoDB Atlas URI with a database name and least-privilege database user |
| `JWT_SECRET` | At least 32 random bytes |
| `ADMIN_USERNAME` | Production admin username |
| `ADMIN_PASSWORD` | Unique password with at least 12 characters |
| `CORS_ORIGINS` | Exact storefront and admin origins, comma-separated, with `https://` |
| `SHOP_URL` | Storefront production URL |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Only if test-mode checkout is configured; use Stripe test keys |

Set `VITE_API_URL` on both frontend projects to `https://<api-project>.vercel.app/api`. Set `VITE_SHOP_URL` on the admin project to the storefront URL. These are build-time public URLs, not secrets. Redeploy each frontend after changing them.

The API only permits origins listed in `CORS_ORIGINS`. Add Vercel preview origins explicitly if preview deployments need to call production data; do not use `*` for an admin API.

## Local demo data

The generator runs only when requested. The recommended order is to validate sample data locally, deploy the API and frontends with a separate Atlas database, and then run the same generator against the hosted demo environment. MongoDB contents are not part of Git and are not transferred by pushing or deploying.

For the running Docker environment, use its configured credentials and database connection:

```powershell
docker compose exec -T backend npm run seed:demo
```

Without Docker, set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `MONGODB_URI` in `backend/.env`, then run:

```powershell
cd backend
npm run seed:demo
```

The dataset contains 5 fictional `example.test` customers; volumes 1–3 of Death Note, One Piece, and Jujutsu Kaisen; 4 rentals with internal receipts (3 active and 1 returned); and 3 simulated purchase orders with printable receipts. Manga titles, descriptions and authors come from the same remote-search API used by the admin panel. The generator selects an exact volume through the volume endpoint, checks that the cover URL serves an image, and creates the manga through `POST /api/mangas`. Missing metadata or covers stop the run with an error; it never substitutes invented metadata or generic covers.

Customers, volumes, rentals, and orders are reused on subsequent runs with the same `DEMO_DATA_TAG` (default `sample`), preserving inventory. Run one generator at a time. If an external provider is temporarily unavailable, rerun the command after it recovers. Rentals and their receipts use the admin APIs; demo purchase records use the backend models and deduct stock, without calling Stripe. Their receipts explicitly identify the payment provider as `local-seed`. They represent fictional activity for a portfolio, not received payments.

For a hosted portfolio demo, create an ignored `backend/.env.demo` locally with `API_URL=https://<api-project>.vercel.app/api`, the matching Atlas `MONGODB_URI`, and the hosted `ADMIN_USERNAME` and `ADMIN_PASSWORD`. Keep secrets out of shell history and Git. From `backend`, select that file and run:

```powershell
$env:DEMO_ENV_FILE = '.env.demo'
npm run seed:demo
Remove-Item Env:DEMO_ENV_FILE
```

The script checks that the API and direct database connection share the imported customers before writing simulated orders. Use the dataset only in an environment intended to contain demo business activity.

To deploy, first authenticate with `npx vercel login`, create the three Vercel project connections, and configure their environment variables. Deploy from the Vercel dashboard or run `npx vercel --prod` inside each module after linking it to the correct project. Populate the hosted demo only once its API is reachable. Keep Stripe in test mode for the portfolio.

The API uses the modern `functions` configuration, without legacy `builds`, because [Vercel does not allow these settings together](https://vercel.com/docs/errors/error-list#conflicting-functions-and-builds-configuration). Its static output directory is intentionally empty; API source files are not published as static assets.
