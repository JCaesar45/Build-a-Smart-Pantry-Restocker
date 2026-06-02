// Smart Pantry Restocker
// A small pantry management program using basic JavaScript concepts

// Parse raw shipment data into structured objects
// Each string is pipe-delimited: sku|name|qty|expires|zone
// Zone defaults to "general" if not provided
function parseShipment(rawData) {
    const seenSkus = new Set();
    const parsed = [];

    for (let i = 0; i < rawData.length; i++) {
        const parts = rawData[i].split("|");

        // Skip malformed entries - gotta be at least 4 parts
        if (parts.length < 4) continue;

        const sku = parts[0].trim();

        // Deduplicate SKUs - first occurrence wins
        if (seenSkus.has(sku)) continue;
        seenSkus.add(sku);

        const name = parts[1].trim();
        const qty = Number(parts[2].trim());
        const expires = parts[3].trim();
        const zone = parts.length >= 5 ? parts[4].trim() : "general";

        parsed.push({ sku, name, qty, expires, zone });
    }

    return parsed;
}

// Compare incoming shipment against current pantry inventory
// Returns action plan: restock (exists), donate (new), discard (bad qty)
function planRestock(pantry, shipment) {
    const actions = [];

    // Build a quick lookup so we don't scan the pantry array repeatedly
    const pantrySkus = new Set();
    for (let i = 0; i < pantry.length; i++) {
        pantrySkus.add(pantry[i].sku);
    }

    for (let i = 0; i < shipment.length; i++) {
        const item = shipment[i];

        if (item.qty <= 0) {
            actions.push({ type: "discard", item });
        } else if (pantrySkus.has(item.sku)) {
            actions.push({ type: "restock", item });
        } else {
            actions.push({ type: "donate", item });
        }
    }

    return actions;
}

// Group actions by their storage zone for organizational purposes
function groupByZone(actions) {
    const grouped = {};

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const zone = action.item.zone;

        if (!grouped[zone]) {
            grouped[zone] = [];
        }

        grouped[zone].push(action);
    }

    return grouped;
}

// Deep copy the pantry so planning doesn't mutate the original
// Using JSON trick - it's crude but works for plain objects
// For production I'd probably use structuredClone() or a recursive copier
function clonePantry(pantry) {
    const copy = [];

    for (let i = 0; i < pantry.length; i++) {
        const item = pantry[i];
        copy.push({
            sku: item.sku,
            name: item.name,
            qty: item.qty,
            expires: item.expires,
            zone: item.zone
        });
    }

    return copy;
}

// Demo run
const rawData = [
    "A10|Tomatoes|5|2027-01-01",
    "B21|Bananas|10|2027-01-01|fridge",
    "C32|Eggs|3|2027-01-01|pantry",
    "A10|Duplicate Tomatoes|99|2027-12-31|fridge",
    "D45|Expired Beans|0|2020-01-01|pantry"
];

const pantry = [
    { sku: "A10", name: "Tomatoes", qty: 2, expires: "2026-06-01", zone: "general" },
    { sku: "E99", name: "Rice", qty: 10, expires: "2028-01-01", zone: "pantry" }
];

// Process the full pipeline
const shipment = parseShipment(rawData);
const safePantry = clonePantry(pantry);
const actions = planRestock(safePantry, shipment);
const grouped = groupByZone(actions);

console.log(grouped);
