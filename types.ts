export enum SoilTexture {
  Clay = 'Clay (Sticky, holds shape)',
  Sand = 'Sandy (Gritty, falls apart)',
  Silt = 'Silt (Smooth, floury)',
  Loam = 'Loam (Balanced, crumbly)',
  Unknown = 'Not sure'
}

export enum CompactionLevel {
  Hard = 'Hard / Impenetrable',
  Firm = 'Firm but workable',
  Soft = 'Soft / Fluffy'
}

export enum DrainageStatus {
  Poor = 'Puddles remain for hours',
  Fast = 'Drains almost instantly',
  Good = 'Drains steadily'
}

export enum BiodiversityLevel {
  None = 'No visible life',
  Low = 'Some ants or small bugs',
  High = 'Teeming with worms and insects'
}

export enum SurfaceCondition {
  Bare = 'Bare soil (exposed)',
  Weeds = 'Overgrown with weeds',
  Mulch = 'Covered with mulch/compost',
  Grass = 'Lawn / Grass'
}

export interface SoilDiagnosisInputs {
  texture: SoilTexture | null;
  compaction: CompactionLevel | null;
  drainage: DrainageStatus | null;
  biodiversity: BiodiversityLevel | null;
  surface: SurfaceCondition | null;
  specificConcern: string;
}

export interface RemediationStep {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface RecommendedPlant {
  name: string;
  benefit: string; // e.g. "Breaks up clay"
  type: 'Cover Crop' | 'Vegetable' | 'Flower';
}

// The structured response for Soil Diagnosis
export interface DiagnosisResponse {
  healthTitle: string; // Short summary, e.g. "Compacted Clay Soil"
  healthScore: number; // 1-10 visual score
  diagnosisSummary: string;
  immediateActions: RemediationStep[];
  longTermStrategy: string;
  recommendedPlants: RecommendedPlant[];
}

export interface PlantingPlanInputs {
  location: string;
  spaceSize: string; // e.g. "10"
  spaceUnit: 'm²' | 'ft²';
  seedInputType: 'text' | 'image';
  seedText: string;
  seedImages: { base64: string; mimeType: string }[];
}

// New structured response types
export interface CropSchedule {
  cropName: string;
  sowIndoors: string | null;
  sowOutdoors: string | null;
  transplant: string | null;
  harvest: string;
  notes: string;
}

export interface SuccessionTip {
  originalCrop: string;
  followUpCrop: string;
  reason: string;
}

export interface PlantingPlanResponse {
  seasonalStrategy: string;
  schedule: CropSchedule[];
  successionPlans: SuccessionTip[];
  spaceMaximizationTip: string;
}

export interface SavedPlan {
  id: string;
  name: string;
  createdAt: Date;
  data: PlantingPlanResponse;
}