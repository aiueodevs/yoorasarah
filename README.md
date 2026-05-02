# Yoora Sarah Website Clone

Struktur project sekarang dipisah menjadi tiga aplikasi:

- `frontend/` - Next.js + Tailwind customer website. Semua data produk diambil dari backend API.
- `backend/` - Bun + Hono API, Drizzle/Postgres, Better Auth, Redis, dan Supabase Storage.
- `portal/` - Next.js + Tailwind admin portal untuk upload produk dan update stock.

## Local Services

Postgres dan Redis disiapkan lewat Docker Compose:

```bash
docker compose up -d
```

Jika Docker Desktop belum menyala, jalankan dulu Docker Desktop lalu ulangi command di atas.

## Backend

```bash
cd backend
cp .env.example .env
bun install
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

Backend berjalan di `http://localhost:4000`.

Kalau database lokal sebelumnya sudah pernah dibuat dari Prisma, cukup jalankan `bun run db:seed` setelah migrasi kode ke Drizzle. Schema Drizzle dibuat kompatibel dengan nama tabel lama agar data produk existing tetap kebaca.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

## Portal

```bash
cd portal
cp .env.example .env
bun install
bun run dev
```

Portal berjalan di `http://localhost:3001`.
