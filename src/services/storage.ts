import { InventoryItem, GearItem, NaturalResource, ShoppingListItem, EncryptedVaultData, LogisticsTicket } from '../types/survival';

const STORAGE_KEYS = {
  INVENTORY: 'aegis_survival_inventory_v1',
  WATER_INTAKE: 'aegis_survival_water_v1',
  CALORIE_INTAKE: 'aegis_survival_calories_v1',
  GEAR: 'aegis_survival_gear_v1',
  SHOPPING: 'aegis_survival_shopping_v1',
  VAULT: 'aegis_survival_vault_v1',
  LOGISTICS: 'aegis_survival_logistics_v1',
  USER_SPECS: 'aegis_survival_user_specs_v1',
};

// Initial realistic default food & supply inventory for 30-day off-grid / outage
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Fresh Dairy & Bread Pack',
    category: 'PERISHABLE_FOOD',
    quantity: 3,
    unit: 'packs',
    caloriesPerUnit: 1200,
    weightOz: 32,
    expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    perishable: true,
    minThreshold: 1,
    location: 'Cooler Box 1',
    notes: 'Ration first! Expires within 48 hours.',
  },
  {
    id: 'inv-002',
    name: 'Fresh Fruits & Vegetables',
    category: 'PERISHABLE_FOOD',
    quantity: 5,
    unit: 'kg',
    caloriesPerUnit: 450,
    weightOz: 176,
    expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    perishable: true,
    minThreshold: 2,
    location: 'Cooler Box 1',
    notes: 'Apples, oranges, carrots. Consume Days 1-4.',
  },
  {
    id: 'inv-003',
    name: 'Mountain House Freeze-Dried Beef Stew',
    category: 'FREEZE_DRIED',
    quantity: 24,
    unit: 'pouches',
    caloriesPerUnit: 600,
    weightOz: 4.8,
    expirationDate: '2050-12-31',
    perishable: false,
    minThreshold: 10,
    location: 'Dry Crate Alpha',
    notes: 'High calories, 30-year shelf life.',
  },
  {
    id: 'inv-004',
    name: 'Potable Water Bladders (5L)',
    category: 'WATER',
    quantity: 12,
    unit: 'bladders',
    caloriesPerUnit: 0,
    weightOz: 176,
    expirationDate: '2028-01-01',
    perishable: false,
    minThreshold: 6,
    location: 'Base Camp Stash',
    notes: 'Total 60L pure drinking water stored.',
  },
  {
    id: 'inv-005',
    name: 'Aquatabs Water Purification Tablets',
    category: 'WATER',
    quantity: 100,
    unit: 'tablets',
    caloriesPerUnit: 0,
    weightOz: 2,
    expirationDate: '2029-06-15',
    perishable: false,
    minThreshold: 30,
    location: 'First Aid Kit',
    notes: '1 tablet treats 1L stream water in 30 mins.',
  },
  {
    id: 'inv-006',
    name: 'Isobutane / Propane Canister (230g)',
    category: 'FUEL',
    quantity: 8,
    unit: 'canisters',
    caloriesPerUnit: 0,
    weightOz: 13,
    expirationDate: '2035-01-01',
    perishable: false,
    minThreshold: 3,
    location: 'Fuel Box',
    notes: 'Burns 60 mins each. Essential for melting snow/boiling.',
  },
  {
    id: 'inv-007',
    name: 'LiFePO4 Solar Power Station 512Wh',
    category: 'POWER_BATTERY',
    quantity: 1,
    unit: 'unit',
    caloriesPerUnit: 0,
    weightOz: 240,
    expirationDate: '2032-01-01',
    perishable: false,
    minThreshold: 1,
    location: 'Tech Case',
    notes: 'Supplies 12V and USB-C output. Recharge via AZ Solar Depot array.',
  },
  {
    id: 'inv-008',
    name: 'High-Density Peanut Butter & Honey',
    category: 'STAPLE_FOOD',
    quantity: 6,
    unit: 'jars',
    caloriesPerUnit: 3200,
    weightOz: 28,
    expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    perishable: false,
    minThreshold: 2,
    location: 'Pantry Box',
    notes: 'Maximum calorie-to-weight ratio (114 kcal/oz).',
  },
  {
    id: 'inv-009',
    name: 'Emergency Medical & Trauma Pack',
    category: 'MEDICAL',
    quantity: 2,
    unit: 'kits',
    caloriesPerUnit: 0,
    weightOz: 45,
    expirationDate: '2028-09-01',
    perishable: false,
    minThreshold: 1,
    location: 'Bag Exterior Slot',
    notes: 'Tourniquets, Israeli bandages, burn gel, antibiotics.',
  }
];

// Initial pre-seeded natural resources in mountain sector
export const INITIAL_RESOURCES: NaturalResource[] = [
  {
    id: 'res-001',
    name: 'Crystal Alpine Spring',
    type: 'WATER_SOURCE',
    lat: 38.8524,
    lng: -105.0441,
    elevationFt: 8650,
    description: 'Year-round high mountain spring issuing from granite bedrock. High flow rate (~15L/min).',
    safetyRating: 'NEEDS_FILTER',
    prepNotes: 'Filter through 0.1 micron Sawyer or boil 1 min to eliminate Giardia risk.',
  },
  {
    id: 'res-002',
    name: 'Eastern White Pine Forest (Pine Needles)',
    type: 'EDIBLE_PLANT',
    lat: 38.8580,
    lng: -105.0390,
    elevationFt: 8400,
    description: 'Abundant Eastern White Pine cluster. Needles contain 4x Vitamin C of lemons.',
    safetyRating: 'SAFE',
    prepNotes: 'Steep fresh green needles (5 needles per cup) in hot water for 10 mins. Do NOT boil to preserve Vitamin C. Avoid Ponderosa/Yew lookalikes.',
    edibleParts: 'Fresh green needles, inner bark (cambium layer cooked).',
    seasonality: 'Year-round'
  },
  {
    id: 'res-003',
    name: 'Wild Dandelion & Plantain Meadow',
    type: 'EDIBLE_PLANT',
    lat: 38.8490,
    lng: -105.0510,
    elevationFt: 8200,
    description: 'Rich meadow with dandelion, broadleaf plantain, and chickweed.',
    safetyRating: 'SAFE',
    prepNotes: 'Leaves edible raw or steamed. Taproots can be roasted as coffee substitute or boiled for carbohydrates.',
    edibleParts: 'Leaves, yellow flowers, roots.',
    seasonality: 'Spring to Autumn'
  },
  {
    id: 'res-004',
    name: 'Granite Rock Overhang Shelter',
    type: 'SHELTER_SPOT',
    lat: 38.8610,
    lng: -105.0480,
    elevationFt: 9100,
    description: 'Natural 12ft granite overhang with wind blockage from North/West.',
    safetyRating: 'SAFE',
    prepNotes: 'Set up tarp wall along South face. Safe distance for small reflector fire.',
  },
  {
    id: 'res-005',
    name: 'High-Point Satellite Signal Ridge',
    type: 'SIGNAL_SPOT',
    lat: 38.8655,
    lng: -105.0320,
    elevationFt: 9540,
    description: 'Unobstructed 360-degree horizon line with optimal satellite LOS.',
    safetyRating: 'SAFE',
    prepNotes: 'Ideal location for Iridium satellite transponder pings & emergency SOS broadcast.',
  },
  {
    id: 'res-006',
    name: 'Dry Lodgepole Pine Deadfall Stand',
    type: 'FIREWOOD_ZONE',
    lat: 38.8510,
    lng: -105.0420,
    elevationFt: 8500,
    description: 'Standing dead lodgepole pine wood with 12% moisture content.',
    safetyRating: 'SAFE',
    prepNotes: 'Burns hot with low smoke. Perfect for nighttime warming and signaling.',
  }
];

// Initial Gear Items for 30-Day Mountain / Off-Grid Trip
export const INITIAL_GEAR: GearItem[] = [
  { id: 'gear-01', name: '4-Season Alpine Expedition Tent', category: 'SHELTER_SLEEP', packed: true, weightGrams: 2800, essentialLevel: 'CRITICAL', notes: 'Rated for 50mph winds' },
  { id: 'gear-02', name: '-15°F Down Sleeping Bag + Compression Sack', category: 'SHELTER_SLEEP', packed: true, weightGrams: 1650, essentialLevel: 'CRITICAL', notes: 'R-value 6.5 pad included' },
  { id: 'gear-03', name: 'Sawyer Squeeze 0.1 Micron Water Filter', category: 'WATER_PURIFICATION', packed: true, weightGrams: 90, essentialLevel: 'CRITICAL', notes: 'Includes 2L dirty pouches' },
  { id: 'gear-04', name: 'Garmin inReach Explorer Satellite Messenger', category: 'NAVIGATION_COMM', packed: true, weightGrams: 213, essentialLevel: 'CRITICAL', notes: 'Synced with Aegis SOS Protocol' },
  { id: 'gear-05', name: 'Magnesium Fire Striker + Tinder Quik Tabs', category: 'FIRE_LIGHT', packed: true, weightGrams: 110, essentialLevel: 'CRITICAL', notes: 'Functions when soaked' },
  { id: 'gear-06', name: 'MSR WindBurner Stove & 1.0L Pot', category: 'COOKING_NUTRITION', packed: true, weightGrams: 430, essentialLevel: 'CRITICAL', notes: 'High-wind performance' },
  { id: 'gear-07', name: '350 Lumens Tactical Headlamp + Red LED Mode', category: 'FIRE_LIGHT', packed: true, weightGrams: 85, essentialLevel: 'CRITICAL', notes: 'Uses 18650 cell' },
  { id: 'gear-08', name: 'Tactical Trauma Kit & SAM Splint', category: 'FIRST_AID_HYGIENE', packed: true, weightGrams: 620, essentialLevel: 'CRITICAL', notes: 'Includes CAT Tourniquet' },
  { id: 'gear-09', name: 'Foldable 50W Solar Charger Panel', category: 'NAVIGATION_COMM', packed: true, weightGrams: 890, essentialLevel: 'HIGH', notes: 'Recharges battery bank' },
  { id: 'gear-10', name: 'Bushcraft Fixed Blade Knife (Full Tang)', category: 'CLOTHING_TOOLS', packed: true, weightGrams: 240, essentialLevel: 'CRITICAL', notes: '1095 Carbon Steel' }
];

// Storage Helper Functions
export const INITIAL_LOCATION: import('../types/survival').UserLocation = {
  address: '14820 Pike National Forest Ridge Rd',
  cityState: 'Woodland Park, CO 80863',
  landmarkNotes: 'Camp Sector 4, North Ridge Overhang',
  lat: 38.8524,
  lng: -105.0441,
  elevationFt: 8650,
  isManualAddress: true,
  updatedAt: new Date().toISOString(),
};

export function getSavedLocation(): import('../types/survival').UserLocation {
  try {
    const raw = localStorage.getItem('aegis_user_location_v1');
    return raw ? JSON.parse(raw) : INITIAL_LOCATION;
  } catch {
    return INITIAL_LOCATION;
  }
}

export function saveLocation(loc: import('../types/survival').UserLocation) {
  localStorage.setItem('aegis_user_location_v1', JSON.stringify(loc));
}

export function getSavedInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return raw ? JSON.parse(raw) : INITIAL_INVENTORY;
  } catch {
    return INITIAL_INVENTORY;
  }
}

export function saveInventory(items: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
}

export function getSavedGear(): GearItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GEAR);
    return raw ? JSON.parse(raw) : INITIAL_GEAR;
  } catch {
    return INITIAL_GEAR;
  }
}

export function saveGear(gear: GearItem[]) {
  localStorage.setItem(STORAGE_KEYS.GEAR, JSON.stringify(gear));
}

// Generate Shopping List automatically from low inventory items
export function generateAutoShoppingList(inventory: InventoryItem[]): ShoppingListItem[] {
  const autoItems: ShoppingListItem[] = [];

  inventory.forEach((item) => {
    if (item.quantity <= item.minThreshold) {
      const targetQty = Math.max(item.minThreshold * 2, 5);
      autoItems.push({
        id: `shop-auto-${item.id}`,
        name: item.name,
        category: item.category,
        currentQty: item.quantity,
        targetQty,
        unit: item.unit,
        purchased: false,
        urgent: item.quantity === 0 || item.perishable,
      });
    }
  });

  return autoItems;
}

// Simple Client-side AES-GCM Encryption / Decryption for Tactical Vault
export async function encryptVault(pin: string, data: EncryptedVaultData): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(pin.padStart(16, '0').slice(0, 16)),
      'AES-GCM',
      false,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encoder.encode(dataString)
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `${ivHex}:${cipherHex}`;
  } catch (err) {
    console.error('Encryption failed, falling back to base64', err);
    return btoa(JSON.stringify({ pin, data }));
  }
}

export async function decryptVault(pin: string, encryptedStr: string): Promise<EncryptedVaultData | null> {
  try {
    if (encryptedStr.includes('{')) {
      const parsed = JSON.parse(atob(encryptedStr));
      return parsed.pin === pin ? parsed.data : null;
    }

    const [ivHex, cipherHex] = encryptedStr.split(':');
    if (!ivHex || !cipherHex) return null;

    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const ciphertext = new Uint8Array(cipherHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(pin.padStart(16, '0').slice(0, 16)),
      'AES-GCM',
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      ciphertext
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch {
    return null;
  }
}
