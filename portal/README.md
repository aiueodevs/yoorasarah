# YOORASARAH Portal

YOORASARAH Portal is the admin interface for product management. Admin users use it to create and edit products, upload images, manage color variants, update stock by color and size, and control product visibility.

The portal does not talk directly to Postgres or Supabase Storage. It calls the backend admin API, and the backend validates auth, role, product payloads, upload safety, and cache invalidation.

## Stack

- Next.js App Router.
- React.
- Tailwind CSS.
- Better Auth client.
- Backend admin API at `http://localhost:4000` by default.

## Folder Guide

- `app/` - portal route entry files.
- `app/login/` - admin login route.
- `app/products/` - product dashboard, create product route, and edit product route.
- `components/login-form.tsx` - Better Auth login form.
- `components/portal-shell.tsx` - session guard, admin role check, portal layout, and forbidden state.
- `components/products-dashboard.tsx` - product list and product actions.
- `components/product-form.tsx` - create/edit product form, color variants, image uploads, and stock matrix.
- `components/edit-product-loader.tsx` - edit page data loader.
- `lib/api.ts` - typed backend admin API client.
- `lib/auth-client.ts` - Better Auth client setup.
- `lib/config.ts` - backend API base URL.

## Environment

Copy the example file before running locally:

```bash
cp .env.example .env
```

Variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL, defaults to `http://localhost:4000` in local examples. |

The portal does not need Supabase or Resend secrets. Those must stay in the backend environment only.

## Local Setup

Install and start:

```bash
bun install
bun run dev
```

Open `http://localhost:3001`.

The backend must be running before login, product management, or uploads can work.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Next.js dev server on port `3001`. |
| `bun run build` | Build production output. |
| `bun run start` | Start the production build on port `3001`. |
| `bun run typecheck` | Run TypeScript checks. |
| `bun audit` | Check dependency advisories. |

## Admin Flow

1. Admin opens the portal and logs in.
2. Better Auth creates a session through the backend.
3. `portal-shell` calls `/api/admin/me`.
4. If there is no session, the user is redirected to `/login`.
5. If the session exists but the user is not admin, the portal shows a forbidden state with logout.
6. Admin opens the product dashboard.
7. Admin creates or edits a product.
8. Admin uploads product images through the backend.
9. Admin manages color variants and their image galleries.
10. Admin fills the stock matrix by color and size.
11. Admin toggles publish state, best seller state, publish date, and sales count.
12. Backend persists the mutation and invalidates related storefront cache.

## Product Management

The product form supports:

- Product name and slug.
- Category slug and optional category name.
- Price.
- Description, materials, and care notes.
- Published state.
- Best seller flag.
- Sales count.
- Publish date.
- Base images.
- Color variants with optional image galleries.
- Stock variant matrix by color and size.

The dashboard displays product data from `/api/admin/products`. Product edits load data from `/api/admin/products/:id`.

## Upload Flow

1. Admin selects an image in the portal.
2. Portal checks file size and MIME type for fast feedback.
3. Portal sends the file to `/api/admin/uploads`.
4. Backend checks admin auth and upload rate limit.
5. Backend validates size, MIME type, and magic bytes.
6. Backend uploads the file to Supabase Storage.
7. Backend returns `storagePath`, `publicUrl`, `alt`, and display metadata.
8. Portal appends the image only after the backend response succeeds.

Default backend upload rules:

- Maximum file size: `5MB`.
- Allowed formats: JPEG, PNG, WebP.
- Unsupported files, spoofed files, SVG, and HTML are rejected.

Common safe upload responses:

| Status | Meaning |
| ---: | --- |
| `413` | File is too large. |
| `415` | File type is unsupported. |
| `502` | Storage upload failed. |
| `503` | Storage is unavailable or misconfigured. |

## Stock Flow

- Stock is edited as a color x size matrix.
- The backend stores stock per variant combination.
- The backend derives total product stock from the matrix.
- Customer product pages use the same stock variants to disable unavailable color/size choices.

## Verification

Run before committing portal changes:

```bash
bun run typecheck
bun run build
bun audit
```

## Troubleshooting

- Redirected to login: the Better Auth session is missing or expired.
- Forbidden state: the logged-in user exists but does not have `role = admin`.
- Product list empty/error: confirm backend is running and the admin session is valid.
- Upload too large: use an image under the backend `MAX_UPLOAD_BYTES` limit.
- Unsupported upload type: use JPEG, PNG, or WebP.
- Storage upload failed: confirm backend Supabase environment variables and bucket.
- Product validation failed: check required fields, image URL origins, hex colors, stock values, and array limits.
- CORS error: add the portal origin to `CORS_ORIGIN` in the backend `.env`.
