# Yoora Sarah Backend

Bun + Hono API untuk produk Yoora Sarah.

## Stack

- Bun runtime
- Hono API
- Drizzle ORM + Postgres
- Better Auth email/password admin login
- Redis untuk Better Auth secondary storage dan cache public API
- Supabase Storage untuk gambar produk

## Commands

```bash
bun install
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

Jika database lokal sudah berisi tabel lama dari Prisma (`Product`, `Category`, dan tabel Better Auth), jalankan `bun run db:seed` saja. Schema Drizzle sengaja mengikuti nama tabel lama agar data existing tidak perlu dipindahkan.

## API

- `GET /health`
- `GET/POST /api/auth/*`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/categories`
- `GET /api/categories/:slug/products`
- `GET /api/collections/new-arrival`
- `GET /api/collections/best-seller`
- `GET /api/admin/products`
- `GET /api/admin/products/:id`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `PATCH /api/admin/products/:id/stock`
- `POST /api/admin/uploads`
