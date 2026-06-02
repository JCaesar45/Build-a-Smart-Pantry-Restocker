// Smart Pantry Restocker - JavaScript Implementation
// A small pantry management program using basic JS concepts

/**
 * Parse raw pipe-delimited shipment strings into structured objects.
 * Format: sku|name|qty|expires|zone (zone optional, defaults to "general")
 * Duplicate SKUs are ignored — first occurrence wins.
 */
function parseShipment(rawData) {
    const seenSkus = new Set();
    const parsed = [];

    for (let i = 0; i < rawData.length; i++) {
        const parts = rawData[i].split('|');

        if (parts.length < 4) continue;

        const sku = parts[0].trim();

        if (seenSkus.has(sku)) continue;
        seenSkus.add(sku);

        const name = parts[1].trim();
        const qty = Number(parts[2].trim());
        const expires = parts[3].trim();
        const zone = parts.length >= 5 ? parts[4].trim() : 'general';

        parsed.push({ sku, name, qty, expires, zone });
    }

    return parsed;
}

/**
 * Compare incoming shipment against current pantry.
 * Returns action array with type: "restock", "discard", or "donate".
 */
function planRestock(pantry, shipment) {
    const actions = [];
    const pantrySkus = new Set();

    for (let i = 0; i < pantry.length; i++) {
        pantrySkus.add(pantry[i].sku);
    }

    for (let i = 0; i < shipment.length; i++) {
        const item = shipment[i];

        if (item.qty <= 0) {
            actions.push({ type: 'discard', item });
        } else if (pantrySkus.has(item.sku)) {
            actions.push({ type: 'restock', item });
        } else {
            actions.push({ type: 'donate', item });
        }
    }

    return actions;
}

/**
 * Group actions by their storage zone.
 */
function groupByZone(actions) {
    const grouped = {};

    for (let i = 0; i < actions.length; i++) {
        const zone = actions[i].item.zone;
        if (!grouped[zone]) grouped[zone] = [];
        grouped[zone].push(actions[i]);
    }

    return grouped;
}

/**
 * Deep copy pantry array so planning doesn't mutate original.
 * Manual property copy avoids JSON.stringify edge cases.
 */
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

// === Full Pipeline Demo ===
const rawData = [
    'A10|Tomatoes|5|2027-01-01',
    'B21|Bananas|10|2027-01-01|fridge',
    'C32|Eggs|3|2027-01-01|pantry',
    'A10|Duplicate Tomatoes|99|2027-12-31|fridge',
    'D45|Expired Beans|0|2020-01-01|pantry'
];

const pantry = [
    { sku: 'A10', name: 'Tomatoes', qty: 2, expires: '2026-06-01', zone: 'general' },
    { sku: 'E99', name: 'Rice', qty: 10, expires: '2028-01-01', zone: 'pantry' }
];

const shipment = parseShipment(rawData);
const safePantry = clonePantry(pantry);
const actions = planRestock(safePantry, shipment);
const grouped = groupByZone(actions);

console.log(grouped);
