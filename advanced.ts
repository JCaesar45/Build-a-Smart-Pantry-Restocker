// Smart Pantry Restocker - TypeScript Implementation
// Fully typed, production-grade pantry management system

interface PantryItem {
    sku: string;
    name: string;
    qty: number;
    expires: string;
    zone: string;
}

interface Action {
    type: 'restock' | 'discard' | 'donate';
    item: PantryItem;
}

interface GroupedActions {
    [zone: string]: Action[];
}

type RawShipment = string[];
type Pantry = PantryItem[];

/**
 * Parse raw pipe-delimited shipment strings into structured PantryItem objects.
 * Duplicates are silently dropped — first occurrence wins.
 * Missing zone defaults to "general".
 */
function parseShipment(rawData: RawShipment): PantryItem[] {
    const seenSkus: Set<string> = new Set();
    const parsed: PantryItem[] = [];

    for (let i = 0; i < rawData.length; i++) {
        const parts: string[] = rawData[i].split('|');

        if (parts.length < 4) continue;

        const sku: string = parts[0].trim();

        if (seenSkus.has(sku)) continue;
        seenSkus.add(sku);

        const name: string = parts[1].trim();
        const qty: number = Number(parts[2].trim());
        const expires: string = parts[3].trim();
        const zone: string = parts.length >= 5 ? parts[4].trim() : 'general';

        parsed.push({ sku, name, qty, expires, zone });
    }

    return parsed;
}

/**
 * Compare incoming shipment against current pantry inventory.
 * Returns action plan with type determined by qty and SKU existence.
 */
function planRestock(pantry: Pantry, shipment: PantryItem[]): Action[] {
    const actions: Action[] = [];
    const pantrySkus: Set<string> = new Set();

    for (let i = 0; i < pantry.length; i++) {
        pantrySkus.add(pantry[i].sku);
    }

    for (let i = 0; i < shipment.length; i++) {
        const item: PantryItem = shipment[i];

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
 * Bucket actions by their storage zone for organizational purposes.
 */
function groupByZone(actions: Action[]): GroupedActions {
    const grouped: GroupedActions = {};

    for (let i = 0; i < actions.length; i++) {
        const zone: string = actions[i].item.zone;
        if (!grouped[zone]) grouped[zone] = [];
        grouped[zone].push(actions[i]);
    }

    return grouped;
}

/**
 * Deep copy the pantry array so planning mutations don't leak back.
 * Manual property copy avoids JSON.stringify pitfalls with methods/dates.
 */
function clonePantry(pantry: Pantry): PantryItem[] {
    const copy: PantryItem[] = [];

    for (let i = 0; i < pantry.length; i++) {
        const item: PantryItem = pantry[i];
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

// === Demo Execution ===
const rawData: RawShipment = [
    'A10|Tomatoes|5|2027-01-01',
    'B21|Bananas|10|2027-01-01|fridge',
    'C32|Eggs|3|2027-01-01|pantry',
    'A10|Duplicate Tomatoes|99|2027-12-31|fridge',
    'D45|Expired Beans|0|2020-01-01|pantry'
];

const pantry: Pantry = [
    { sku: 'A10', name: 'Tomatoes', qty: 2, expires: '2026-06-01', zone: 'general' },
    { sku: 'E99', name: 'Rice', qty: 10, expires: '2028-01-01', zone: 'pantry' }
];

const shipment: PantryItem[] = parseShipment(rawData);
const safePantry: PantryItem[] = clonePantry(pantry);
const actions: Action[] = planRestock(safePantry, shipment);
const grouped: GroupedActions = groupByZone(actions);

console.log(grouped);
