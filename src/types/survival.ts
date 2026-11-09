export type SupplyCategory = 
  | 'WATER'
  | 'PERISHABLE_FOOD'
  | 'STAPLE_FOOD'
  | 'FREEZE_DRIED'
  | 'FUEL'
  | 'POWER_BATTERY'
  | 'MEDICAL'
  | 'TOOLS';

export interface InventoryItem {
  id: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  unit: string;
  caloriesPerUnit: number;
  weightOz: number;
  expirationDate: string; // ISO YYYY-MM-DD
  perishable: boolean;
  minThreshold: number;
  location: string;
  notes?: string;
}

export type TripScenario = 
  | 'MOUNTAIN_30_DAY'
  | 'POWER_OUTAGE_GRID_DOWN'
  | 'WINTER_OFF_GRID'
  | 'BUG_OUT_72_HOUR'
  | 'DESERT_TREK';

export interface GearItem {
  id: string;
  name: string;
  category: 'SHELTER_SLEEP' | 'WATER_PURIFICATION' | 'NAVIGATION_COMM' | 'FIRE_LIGHT' | 'COOKING_NUTRITION' | 'FIRST_AID_HYGIENE' | 'CLOTHING_TOOLS';
  packed: boolean;
  weightGrams: number;
  essentialLevel: 'CRITICAL' | 'HIGH' | 'OPTIONAL';
  notes?: string;
}

export type ResourceType = 
  | 'WATER_SOURCE'
  | 'EDIBLE_PLANT'
  | 'SHELTER_SPOT'
  | 'SIGNAL_SPOT'
  | 'FIREWOOD_ZONE';

export interface NaturalResource {
  id: string;
  name: string;
  type: ResourceType;
  lat: number;
  lng: number;
  elevationFt: number;
  description: string;
  safetyRating: 'SAFE' | 'NEEDS_BOILING' | 'NEEDS_FILTER' | 'DANGEROUS_LOOKALIKE';
  prepNotes: string;
  edibleParts?: string;
  seasonality?: string;
}

export interface WeatherData {
  tempF: number;
  windSpeedMph: number;
  windDirection: string;
  pressureHpa: number;
  pressureTrend: 'RISING_FAIR' | 'STEADY_STABLE' | 'FALLING_STORM';
  humidityPercent: number;
  freezeRisk: 'LOW' | 'MODERATE' | 'CRITICAL';
  cloudCeilingFt: number;
  lightningDistanceMiles: number | null;
  elevationFt: number;
}

export interface LogisticsTicket {
  ticketId: string;
  itemCategory: string;
  itemDetails: string;
  quantity: number;
  status: 'QUEUED' | 'SATELLITE_DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  recipient: string;
  recipientPhone: string;
  dropCoordinates: string;
  urgency: 'STANDARD' | 'HIGH' | 'EMERGENCY';
  timestamp: string;
  etaNotes: string;
}

export interface PushNotification {
  id: string;
  timestamp: string;
  sender: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  read: boolean;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: SupplyCategory;
  currentQty: number;
  targetQty: number;
  unit: string;
  purchased: boolean;
  urgent: boolean;
}

export interface EncryptedVaultData {
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  iceContactName: string;
  iceContactPhone: string;
  satelliteKeyId: string;
  passportIdNotes: string;
  emergencyInstructions: string;
}

export interface UserLocation {
  address: string;
  cityState: string;
  landmarkNotes?: string;
  lat: number;
  lng: number;
  elevationFt: number;
  isManualAddress: boolean;
  updatedAt: string;
}

export type AppPowerMode = 
  | 'STANDARD_TACTICAL'
  | 'OLED_BATTERY_SAVER'
  | 'RED_VISION_NIGHT'
  | 'MINIMAL_EMERGENCY';
