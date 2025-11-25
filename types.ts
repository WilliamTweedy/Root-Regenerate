

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  gardenerLevel: 'Novice' | 'Apprentice' | 'Green Thumb' | 'Master Gardener';
}

export interface Plant {
  id: string;
  name: string; // e.g., "Tomato - Money Maker"
  type: string; // Vegetable, Flower, Herb
  plantedDate: Date;
  imageUrl?: string;
  notes?: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  estimatedHarvestDate?: Date;
  sowStatus?: string;
  isPlanted: boolean; // New field for tracking status
  // Extended fields for detailed cards
  sowIndoors?: string;
  sowOutdoors?: string;
  transplant?: string;
  harvest?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userLevel: string;
  timestamp: Date; // Using JS Date for simpler UI handling
}

export interface HarvestLog {
  id: string;
  cropName: string;
  weightKg: number;
  rating: 1 | 2 | 3 | 4 | 5;
  date: Date;
  imageUrl?: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  isFrostWarning: boolean;
}

// Scanner Types
export interface PlantIdentificationResult {
  name: string;
  type: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  confidence: number;
  notes: string;
  // Added detailed schedule fields
  sowIndoors: string;
  sowOutdoors: string;
  transplant: string;
  harvest: string;
}

// Soil Diagnosis Types

export enum SoilTexture {
  Sandy = "Sandy (Gritty)",
  Silty = "Silty (Smooth)",
  Clay = "Clay (Sticky)",
  Loam = "Loam (Balanced)",
  Chalky = "Chalky (Stony)"
}

export enum CompactionLevel {
  Loose = "Loose (Easy to dig)",
  Moderate = "Moderate (Firm but workable)",
  Hard = "Hard (Needs force)",
  RockHard = "Rock Hard (Impenetrable)"
}

export enum DrainageStatus {
  Fast = "Fast (Drains instantly)",
  Good = "Good (Drains in minutes)",
  Slow = "Slow (Puddles for hours)",
  Waterlogged = "Waterlogged (Days)"
}

export enum BiodiversityLevel {
  None = "None Visible",
  Low = "Low (Few worms/bugs)",
  Moderate = "Moderate",
  High = "High (Teeming with life)"
}

export enum SurfaceCondition {
  Bare = "Bare Soil",
  Mulched = "Mulched",
  Weeds = "Weeds/Grass",
  Crops = "Existing Crops"
}

export interface SoilDiagnosisInputs {
  texture: string | null;
  compaction: string | null;
  drainage: string | null;
  biodiversity: string | null;
  surface: string | null;
  specificConcern: string;
}

export interface DiagnosisResponse {
  healthTitle: string;
  healthScore: number;
  diagnosisSummary: string;
  immediateActions: {
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
  }[];
  longTermStrategy: string;
  recommendedPlants: {
    name: string;
    benefit: string;
    type: "Cover Crop" | "Vegetable" | "Flower";
  }[];
}

// Plant Doctor Types
export interface PlantHealthResult {
  diagnosis: string;
  confidence: "High" | "Medium" | "Low";
  symptoms: string[];
  cause: string;
  organicCure: string;
  prevention: string;
  isHealthy: boolean;
}

// Gap Filler Types
export interface GapFillerInputs {
  gapSize: string; // e.g. "30cm x 30cm"
  surroundingPlants: string; // e.g. "Tomatoes, Basil"
  goal: 'Food' | 'Soil Regeneration';
  useInventory: boolean;
  location: string;
}

export interface GapFillerResult {
  recommendedPlant: string;
  reasoning: string;
  plantingInstructions: string;
  companionBenefits: string;
  isFromInventory: boolean;
}

// Recipe Types
export interface RecipeResult {
  title: string;
  description: string;
  prepTime: string;
  ingredients: string[];
  steps: string[];
  chefsNote: string;
}

// Planting Plan Types

export interface PlantingPlanInputs {
  location: string;
  spaceSize: string;
  spaceUnit: 'm²' | 'ft²';
  seedInputType: 'text' | 'image';
  seedText: string;
  seedImages: {
    base64: string;
    mimeType: string;
  }[];
}

export interface PlantingPlanResponse {
  seasonalStrategy: string;
  schedule: {
    cropName: string;
    sowIndoors: string;
    sowOutdoors: string;
    transplant: string;
    harvest: string;
    notes: string;
  }[];
  successionPlans: {
    originalCrop: string;
    followUpCrop: string;
    reason: string;
  }[];
  spaceMaximizationTip: string;
}

export interface SavedPlan {
  id: string;
  userId: string;
  name: string;
  data: PlantingPlanResponse;
  createdAt: Date;
}