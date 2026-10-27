export type PlantSpeciesType = 
  | 'fern'
  | 'monstera'
  | 'succulent'
  | 'ficus'
  | 'snake_plant'
  | 'peace_lily'
  | 'custom';

export type SunlightPreference = 'low' | 'indirect' | 'direct';

export interface PlantProfile {
  id: string;
  name: string;
  species: string;
  speciesType: PlantSpeciesType;
  potSizeCm: number;
  indoor: boolean;
  sunlightPref: SunlightPreference;
  wateringIntervalDays: number;
  healthScore: number; // 0 - 100
  moisturePercent: number; // 0 - 100
  lastWatered: string; // ISO date
  lastMisted?: string;
  lastFertilized?: string;
  createdAt: string;
  notes: string;
  isProtected?: boolean; // Starter Fern is protected
  rotationDeg: number;
}

export interface WateringRecord {
  id: string;
  plantId: string;
  timestamp: string;
  amountMl: number;
  note?: string;
  type: 'water' | 'mist' | 'fertilizer';
}

export interface DiaryEntry {
  id: string;
  plantId: string;
  date: string;
  title: string;
  content: string;
  growthStageCm?: number;
  mood: 'thriving' | 'stable' | 'wilting' | 'blooming' | 'pest_alert';
  photoUrl?: string;
}

export interface CareTask {
  id: string;
  plantId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'urgent' | 'normal' | 'low';
  type: 'water' | 'mist' | 'fertilize' | 'prune' | 'rotate';
}

export interface WeatherData {
  city: string;
  country?: string;
  tempC: number;
  humidity: number;
  uvIndex: number;
  weatherCode: number;
  description: string;
  isDay: boolean;
  windKmh: number;
  careRecommendation: string;
}

export interface JarvisMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionTriggered?: string;
}

export interface SimulationParams {
  daysAhead: number;
  wateringFrequencyDays: number;
  sunlightExposure: 'low' | 'balanced' | 'intense';
  fertilizerUsed: boolean;
}
