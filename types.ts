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

export interface DiagnosisResult {
  diagnosis: string;
  actionPlan: string[];
  longTermStrategy: string;
}