# YOORASARAH Backend

YOORASARAH Backend is the API layer for the commerce platform. It owns product data, categories, search, cart, wishlist, admin product management, image uploads, email verification, Redis cache, and security-sensitive integrations.

The frontend and portal should call this API instead of reading local data, writing directly to the database, or talking directly to Supabase Storage.

## Stack

- Bun runtime.
- Hono API framework.
- Drizzle ORM with Postgres.
- Redis for cache, rate limits, and Better Auth secondary storage.
- Better Auth for email/password auth, sessions, email verification, and admin role checks.
- Supabase Storage for product images.
- Resend for verification emails.
- Zod for request validation.

## Folder Guide

- `src/server.ts` - Hono app setup, CORS, auth handler, security headers, and error handling.
- `src/routes/public.ts` - public products, search, categories, cart, wishlist, and customer session routes.
- `src/routes/admin.ts` - admin-only product CRUD, stock update, and uploads.
- `src/products/` - product schemas, presenter, stock helpers, cache keys, and product service logic.
- `src/storefront/` - cart, wishlist, guest session, customer session, and storefront schemas.
- `src/uploads/` - Supabase Storage upload validation and deletion helpers.
- `src/email/` - Resend email verification sender and verification URL handling.
- `src/db/` - Drizzle schema, database client, Redis client, and seed script.
- `src/tests/` - Bun tests for API contracts, auth, cache, upload security, stock, and environment hardening.

## Environment

Copy the example file before running locally:

```bash
cp .env.example .env
```

Important variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | Yes | Backend port, defaults to `4000` locally. |
| `NODE_ENV` | Yes | `development`, `test`, or `production`. |
| `DATABASE_URL` | Yes | Postgres connection string. |
| `REDIS_URL` | Yes | Redis connection string. |
| `BETTER_AUTH_SECRET` | Yes | Session/auth secret. Must be strong in production. |
| `BETTER_AUTH_URL` | Yes | Public backend auth URL. |
| `CORS_ORIGIN` | Yes | Comma-separated allowed frontend and portal origins. |
| `RESEND_API_KEY` | Production | Required for verification emails. |
| `EMAIL_FROM` | Yes | Sender identity for auth emails. |
| `EMAIL_VERIFICATION_LIMIT` | Optional | Verification email limit, default `3`. |
| `EMAIL_VERIFICATION_WINDOW_SECONDS` | Optional | Verification limit window, default `900`. |
| `SUPABASE_URL` | Production | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Backend-only storage secret. Never expose to frontend or portal. |
| `SUPABASE_STORAGE_BUCKET` | Yes | Product image bucket, default `product-images`. |
| `MAX_UPLOAD_BYTES` | Optional | Upload limit, default `5242880` bytes. |
| `TRUST_PROXY` | Optional | Use forwarded IP headers only when behind trusted proxy. |
| `STORAGE_PUBLIC_ORIGINS` | Yes | Allowed public image URL origins. |
| `ADMIN_EMAIL` | Seed | Admin account email for seed. |
| `ADMIN_PASSWORD` | Seed | Admin account password for seed. Empty means no admin is seeded. |

Production startup rejects insecure default secrets and missing production-only secrets.

## Local Setup

Start local Postgres and Redis from the repository root:

```bash
docker compose up -d
```

Install dependencies, migrate, seed, and start:

```bash
bun install
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

The API runs at `http://localhost:4000`.

If a local database already contains older compatible tables, run migrations first, then seed. The Drizzle schema uses existing table names so existing product/auth data can remain readable.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start backend in watch mode. |
| `bun run start` | Start backend without watch mode. |
| `bun run typecheck` | Run TypeScript checks. |
| `bun test` | Run Bun tests. |
| `bun run db:generate` | Generate Drizzle migrations. |
| `bun run db:migrate` | Apply Drizzle migrations. |
| `bun run db:push` | Push schema directly, mainly for local iteration. |
| `bun run db:seed` | Seed products/admin data. |
| `bun run db:studio` | Open Drizzle Studio. |
| `bun audit` | Check dependency advisories. |

## API Reference

Health:

- `GET /health`

Auth:

- `GET /api/auth/*`
- `POST /api/auth/*`

Public products and collections:

- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/search/products?q=&categorySlug=&sort=&page=&limit=`
- `GET /api/categories`
- `GET /api/categories/:slug/products`
- `GET /api/collections/new-arrival`
- `GET /api/collections/best-seller`

Customer/session:

- `GET /api/customer/me`
- `POST /api/customer/session/attach`
- `POST /api/customer/session/guest`

Cart:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

Wishlist:

- `GET /api/wishlist`
- `POST /api/wishlist/items`
- `DELETE /api/wishlist/items/:productId`

Admin:

- `GET /api/admin/me`
- `GET /api/admin/products`
- `GET /api/admin/products/:id`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `PATCH /api/admin/products/:id/stock`
- `POST /api/admin/uploads`

## Data Flow

- Public product and search requests read published products from Postgres and use Redis cache where applicable.
- Admin create/update/delete operations write to Postgres and invalidate related product/search/listing cache keys.
- Uploads are accepted only through `/api/admin/uploads`; the backend validates the file, uploads it to Supabase Storage, and returns `storagePath` plus `publicUrl`.
- Product records store image metadata. The portal and frontend only receive public URLs and storage paths returned by the backend.

## Stock Behavior

- `Product.stock` is a derived total from variant stock rows.
- Variant stock is keyed by product, color, and size.
- Cart add/update validates the selected product/color/size combination against current stock.
- Adding to cart does not reduce stock yet; stock should be reduced later when an order/checkout flow is added.

## Upload Rules

Default upload policy:

- Maximum file size: `5MB`.
- Allowed formats: JPEG, PNG, WebP.
- SVG, HTML, unsupported files, and MIME/extension spoofing are rejected.
- Backend validates magic bytes and maps MIME type to the stored extension.
- User filenames are ignored; backend generates storage paths.

Safe upload errors:

| Status | Code | Meaning |
| ---: | --- | --- |
| `413` | `UPLOAD_TOO_LARGE` | File is larger than the configured limit. |
| `415` | `UNSUPPORTED_UPLOAD_TYPE` | File type is not JPEG, PNG, or WebP. |
| `502` | `STORAGE_UPLOAD_FAILED` | Storage upload failed. |
| `503` | `STORAGE_UNAVAILABLE` | Storage service or config is unavailable. |

## Auth And Security

- Better Auth handles email/password auth and session cookies.
- Email verification is required before normal customer login.
- Admin routes require an authenticated user with `role = admin`.
- Verification emails are rate-limited by email, purpose, and IP.
- Auth, search, uploads, admin mutations, cart/wishlist mutations, and guest session creation are rate-limited through Redis.
- CORS only allows configured origins.
- Unknown production errors return a generic response.
- `SUPABASE_SERVICE_ROLE_KEY` must stay backend-only.

## Verification

Run these before committing backend changes:

```bash
bun test
bun run typecheck
bun audit
```

## Troubleshooting

- Postgres connection failed: check Docker Desktop, then confirm `DATABASE_URL`.
- Redis connection failed: check Docker Redis on `6379`, then confirm `REDIS_URL`.
- Migration failed: run `bun run db:generate`, review generated SQL, then `bun run db:migrate`.
- Admin user missing: set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `bun run db:seed`.
- Email not sent: configure `RESEND_API_KEY` and `EMAIL_FROM`.
- Email rate limited: wait for `EMAIL_VERIFICATION_WINDOW_SECONDS` or use a different test email.
- Upload unavailable: configure Supabase env values and ensure the bucket exists.
- CORS blocked: add the frontend or portal URL to `CORS_ORIGIN`.
