# YOORASARAH Frontend

YOORASARAH Frontend is the customer-facing storefront. It renders the homepage, category pages, product detail pages, search, cart, wishlist, auth pages, and profile settings.

The storefront reads product, category, cart, wishlist, and auth state from the backend API. It should not use runtime local fallback data when the backend is unavailable.

## Stack

- Next.js App Router.
- React.
- Tailwind CSS.
- Better Auth client.
- Backend API at `http://localhost:4000` by default.

## Folder Guide

- `app/` - route segments and page entry files.
- `components/layout/` - header, footer, ticker, mobile drawer, assistant actions, and site shell.
- `components/pages/` - page-level UI for home, category, search, cart, wishlist, profile, auth, and product detail.
- `components/product/` - product cards and grids.
- `components/shared/` - reusable shared UI helpers.
- `components/store/` - cart/wishlist/customer session provider logic.
- `lib/api.ts` - typed backend API client for products, search, cart, wishlist, and customer session.
- `lib/auth-client.ts` - Better Auth client setup.
- `lib/storefront.ts` - storefront route/category helpers.
- `public/assets/` - local visual assets used by the storefront.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and editorial landing experience. |
| `/produk` | All published products. |
| `/terbaru` | New arrival collection. |
| `/best-seller` | Best seller collection. |
| `/search` | Product search and filtering. |
| `/cart` | Shopping cart. |
| `/wishlist` | Saved products. |
| `/profile` | Customer profile, email update, password update, verification status. |
| `/login` | Customer login. |
| `/register` | Customer registration. |
| `/[category]/[slug]` | Product detail pages. |
| Category routes | Category pages such as `/dress`, `/kids-9967`, `/one-set-5182`, and others. |

## Environment

The frontend uses the backend at `http://localhost:4000` by default.

Optional variables:

| Variable | Purpose |
| --- | --- |
| `API_BASE_URL` | Server-side backend API URL override. |
| `NEXT_PUBLIC_API_BASE_URL` | Browser-visible backend API URL override. |

Use these when the backend does not run on `http://localhost:4000`.

## Local Setup

Install and start:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Make sure the backend is running before testing pages that need product, cart, wishlist, or auth data.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Build production output. |
| `npm run start` | Start the production build. |
| `npm run typecheck` | Run TypeScript checks. |
| `npm audit --audit-level=moderate` | Check dependency advisories. |

## Customer Flow

1. Guest opens the homepage and browses highlighted products.
2. Guest opens `/produk`, `/terbaru`, `/best-seller`, a category page, or `/search`.
3. Product lists are fetched from the backend API.
4. Guest opens a product detail page.
5. Guest selects a color and size. Unavailable stock combinations are disabled.
6. Guest adds the item to cart. The page stays in place; it does not redirect to cart.
7. Guest can edit cart quantity, color, and size from `/cart`.
8. Guest can add or remove products from wishlist.
9. Guest can register, verify email, log in, and open `/profile`.
10. Customer can update email and password from the profile page.

## Data Flow

- Product listing/detail/search data comes from backend endpoints.
- Cart and wishlist operations call backend endpoints and persist through a backend HttpOnly guest cookie.
- Auth state comes from Better Auth through the backend.
- Backend offline states must show an error or empty state; they must not show stale local product data as if it were live.

## UI And Assets

- Product images can come from backend product URLs, Supabase Storage, or configured public storage URLs.
- Remote image hosts are configured in `next.config.mjs`.
- Security headers are configured in `next.config.mjs`.
- Product cards and page layouts should stay consistent with the current YOORASARAH visual system.

## Verification

Run before committing frontend changes:

```bash
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Troubleshooting

- Products do not load: confirm the backend is running and reachable from the configured API base URL.
- Search returns empty/error: check `/api/search/products` on the backend.
- Cart or wishlist resets: confirm browser cookies are allowed for the backend origin.
- Images do not render: confirm the image host is allowed in `next.config.mjs`.
- Login fails: the email may be unverified, credentials may be wrong, or the backend auth endpoint may be unavailable.
- CORS error: add the frontend origin to `CORS_ORIGIN` in the backend `.env`.
