import { PlantProfile, WateringRecord, DiaryEntry, CareTask } from '../types';

const STORAGE_KEYS = {
  PLANTS: 'planttwin_jarvis_plants',
  ACTIVE_PLANT_ID: 'planttwin_jarvis_active_id',
  WATERING_LOGS: 'planttwin_jarvis_watering',
  DIARY_ENTRIES: 'planttwin_jarvis_diary',
  TASKS: 'planttwin_jarvis_tasks',
  SCRATCHPAD: 'planttwin_jarvis_scratchpad',
  WEATHER_CITY: 'planttwin_jarvis_city',
  SETTINGS: 'planttwin_jarvis_settings',
};

// Initial starter Fern profile (protected per README)
const DEFAULT_FERN: PlantProfile = {
  id: 'starter-fern-001',
  name: 'Aero Boston Fern',
  species: 'Nephrolepis exaltata',
  speciesType: 'fern',
  potSizeCm: 18,
  indoor: true,
  sunlightPref: 'indirect',
  wateringIntervalDays: 4,
  healthScore: 92,
  moisturePercent: 68,
  lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  lastMisted: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  lastFertilized: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  notes: 'Native to tropical regions. Loves high humidity and dappled indirect sunlight. Starter digital twin.',
  isProtected: true,
  rotationDeg: 0,
};

const DEFAULT_MONSTERA: PlantProfile = {
  id: 'monstera-deliciosa-002',
  name: 'Cyber Monstera',
  species: 'Monstera deliciosa',
  speciesType: 'monstera',
  potSizeCm: 24,
  indoor: true,
  sunlightPref: 'indirect',
  wateringIntervalDays: 7,
  healthScore: 88,
  moisturePercent: 45,
  lastWatered: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  lastMisted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  notes: 'Showcases iconic fenestrations. Prefers chunky, well-draining aroid mix.',
  isProtected: false,
  rotationDeg: 45,
};

const INITIAL_WATERING: WateringRecord[] = [
  {
    id: 'w-1',
    plantId: 'starter-fern-001',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    amountMl: 250,
    note: 'Deep soak with filtered water',
    type: 'water',
  },
  {
    id: 'w-2',
    plantId: 'starter-fern-001',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    amountMl: 50,
    note: 'Foliar misting for humidity',
    type: 'mist',
  },
  {
    id: 'w-3',
    plantId: 'monstera-deliciosa-002',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    amountMl: 500,
    note: 'Regular bi-weekly watering',
    type: 'water',
  },
];

const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'd-1',
    plantId: 'starter-fern-001',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'New Frond Unfurling',
    content: 'Observed a vibrant fiddlehead unraveling in the central crown. Moisture levels have remained stable at 65-70%.',
    growthStageCm: 22,
    mood: 'thriving',
  },
  {
    id: 'd-2',
    plantId: 'monstera-deliciosa-002',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Fifth Leaf Fenestration',
    content: 'A huge new leaf unfurled with 4 natural slits! Cleaned dust off the mature foliage with damp cloth.',
    growthStageCm: 48,
    mood: 'blooming',
  },
];

const INITIAL_TASKS: CareTask[] = [
  {
    id: 't-1',
    plantId: 'starter-fern-001',
    title: 'Water Boston Fern',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'urgent',
    type: 'water',
  },
  {
    id: 't-2',
    plantId: 'starter-fern-001',
    title: 'Mist Fronds for Ambient Humidity',
    dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'normal',
    type: 'mist',
  },
  {
    id: 't-3',
    plantId: 'monstera-deliciosa-002',
    title: 'Rotate Pot 90° for Balanced Sunlight',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'low',
    type: 'rotate',
  },
  {
    id: 't-4',
    plantId: 'monstera-deliciosa-002',
    title: 'Inspect Underleaf for Spider Mites',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    priority: 'normal',
    type: 'prune',
  },
];

export const storage = {
  getPlants: (): PlantProfile[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const init = [DEFAULT_FERN, DEFAULT_MONSTERA];
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(init));
    return init;
  },

  savePlants: (plants: PlantProfile[]) => {
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
  },

  getActivePlantId: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PLANT_ID) || DEFAULT_FERN.id;
  },

  setActivePlantId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANT_ID, id);
  },

  getWateringLogs: (): WateringRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATERING_LOGS);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.WATERING_LOGS, JSON.stringify(INITIAL_WATERING));
    return INITIAL_WATERING;
  },

  saveWateringLogs: (logs: WateringRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.WATERING_LOGS, JSON.stringify(logs));
  },

  getDiaryEntries: (): DiaryEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIARY_ENTRIES);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(INITIAL_DIARY));
    return INITIAL_DIARY;
  },

  saveDiaryEntries: (entries: DiaryEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(entries));
  },

  getTasks: (): CareTask[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  },

  saveTasks: (tasks: CareTask[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getScratchpad: (): string => {
    return localStorage.getItem(STORAGE_KEYS.SCRATCHPAD) || 
`// JARVIS PLANT OBSERVATION SCRATCHPAD
- Soil moisture drops ~8% per day in current room humidity.
- Boston Fern response to morning misting is positive.
- Next fertilizer cycle scheduled for spring equinox.`;
  },

  saveScratchpad: (content: string) => {
    localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, content);
  },

  getWeatherCity: (): string => {
    return localStorage.getItem(STORAGE_KEYS.WEATHER_CITY) || 'San Francisco';
  },

  saveWeatherCity: (city: string) => {
    localStorage.setItem(STORAGE_KEYS.WEATHER_CITY, city);
  },

  exportAllData: (): string => {
    const backup = {
      version: 'PlantTwin-JARVIS-OS-V13',
      exportedAt: new Date().toISOString(),
      plants: storage.getPlants(),
      watering: storage.getWateringLogs(),
      diary: storage.getDiaryEntries(),
      tasks: storage.getTasks(),
      scratchpad: storage.getScratchpad(),
      city: storage.getWeatherCity(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importData: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.plants && Array.isArray(data.plants)) {
        storage.savePlants(data.plants);
      }
      if (data.watering && Array.isArray(data.watering)) {
        storage.saveWateringLogs(data.watering);
      }
      if (data.diary && Array.isArray(data.diary)) {
        storage.saveDiaryEntries(data.diary);
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        storage.saveTasks(data.tasks);
      }
      if (typeof data.scratchpad === 'string') {
        storage.saveScratchpad(data.scratchpad);
      }
      return true;
    } catch {
      return false;
    }
  }
};
