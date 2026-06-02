# Smart Pantry Restocker

A fully functional pantry management system that parses incoming shipment data, plans restock actions against current inventory, groups results by storage zone, and maintains immutable pantry state through deep cloning. Built with vanilla JavaScript, TypeScript, and a luxurious interactive web interface.

## What It Does

The system takes raw pipe-delimited shipment strings (like `sku|name|qty|expires|zone`), converts them into structured objects, compares them against your existing pantry, and decides whether each item should be **restocked** (already in pantry), **donated** (new item), or **discarded** (bad quantity). Everything gets grouped by storage zone for easy organization.

## Files

| File | Description |
|------|-------------|
| `index.html` | Interactive web app with particle effects, real-time console, animated stats, and zone-grouped action cards |
| `smart_pantry.js` | Standalone JavaScript implementation |
| `smart_pantry.ts` | Fully typed TypeScript implementation with interfaces |

## API

### `parseShipment(rawData: string[]): PantryItem[]`

Takes an array of pipe-delimited strings and returns parsed objects. Duplicates are ignored (first occurrence wins). Missing zone defaults to `"general"`. Quantity is coerced to a number.

```js
const raw = [
  "A10|Tomatoes|5|2027-01-01",
  "B21|Bananas|10|2027-01-01|fridge"
];
parseShipment(raw);
// => [{ sku: "A10", name: "Tomatoes", qty: 5, expires: "2027-01-01", zone: "general" }, ...]
```

### `planRestock(pantry: PantryItem[], shipment: PantryItem[]): Action[]`

Compares shipment against pantry. Returns actions:
- `"discard"` if qty <= 0 (regardless of pantry existence)
- `"restock"` if SKU exists in pantry
- `"donate"` if SKU is new

Uses a `Set` for O(1) pantry lookups rather than nested iteration.

### `groupByZone(actions: Action[]): { [zone]: Action[] }`

Buckets actions by their `item.zone` property. Returns an object where keys are zone names and values are arrays of actions.

### `clonePantry(pantry: PantryItem[]): PantryItem[]`

Returns a deep copy of the pantry array. Each object is manually reconstructed with spread properties rather than `JSON.parse(JSON.stringify(...))`, which avoids prototype stripping and date mangling.

## The Web App

Open `index.html` in any modern browser. Features include:

- **Particle system** — 60 floating gold particles that react to mouse movement
- **Ambient drift background** — subtle radial gradients that slowly animate
- **Grid overlay** — fine mesh pattern for that technical feel
- **Live console** — terminal-style output with timestamps and color-coded log levels
- **Animated stat counters** — cubic-eased number transitions on process
- **Zone-grouped cards** — actions rendered with color-coded borders and staggered entrance animations
- **Demo data loader** — one-click populate with realistic test cases

## Design Decisions

I went with explicit `for` loops over `Array.prototype` methods throughout the core logic. For a lab exercise, readability matters more than one-liner elegance. The `Set` lookup in `planRestock` keeps it O(n + m) instead of O(n * m). The deep copy uses manual property assignment — no `JSON.stringify` hacks because those silently drop methods and mangle `Date` objects. The TypeScript version uses strict interfaces and avoids `any` entirely.

The CSS uses CSS custom properties for theming, a `clamp()`-based fluid type scale, and `grid` with `auto-fit` for responsive layouts. The particle canvas runs on `requestAnimationFrame` with a lightweight particle class that resets off-screen particles rather than garbage-collecting them.

## References

Concentrus. (2026, February 6). *15 inventory management best practices to cut costs in 2026*. https://concentrus.com/inventory-management-best-practices/

Tailor Tech. (2024, December 6). *Top 5 inventory management best practices for retailers in 2026*. https://www.tailor.tech/resources/posts/inventory-management-best-practices

Genic Solutions. (2026, April 2). *Inventory management basics: 2026 complete guide*. https://www.genicsolutions.com/beginners-guide-to-inventory-management-2026-edition/

Unleashed Software. (2026, February 24). *Top inventory management trends to watch for in 2026*. https://www.unleashedsoftware.com/blog/inventory-management-trends/

## License

MIT
