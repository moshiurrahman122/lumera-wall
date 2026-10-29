# Lumera Fragrance Wall

A Next.js (App Router, TypeScript) storefront where each perfume sits on a glass shelf under its own ceiling spotlight.

- **Hover** a bottle: its spotlight switches on and the name, scent family and price show under the shelf.
- **Click** a bottle: the whole wall zooms in on it like a camera. The shelf glows, and a panel shows the price, 50 ml / 100 ml sizes, scent notes and **Add to cart**.
- Close the zoom with the **×** button, **Back to wall**, the **Esc** key, or a click on the empty wall. Arrow keys or the on-screen arrows move between bottles.
- The cart is saved in the browser (localStorage). Checkout isn't connected yet.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Home page, renders the wall |
| `app/layout.tsx` | Fonts (Archivo, IBM Plex Mono, Marcellus) and page metadata |
| `app/globals.css` | All styles: wall, shelves, spotlights, zoom view, cart |
| `components/FragranceWall.tsx` | The interactive wall, zoom and cart (client component) |
| `lib/products.ts` | Product list, sizes and pricing |
| `public/products/*.webp` | Bottle photos, named by product `id` |

## Changing products

Edit `lib/products.ts`. Each product needs an `id` that matches a photo in `public/products/<id>.webp` (transparent background, trimmed close to the bottle). The names, notes and prices in there now are placeholders.
