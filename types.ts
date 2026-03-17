
export type SubLevel = 'minus' | 'neutral' | 'plus';

export type AvalancheProblem = 'neuschnee' | 'triebschnee' | 'altschnee' | 'nassschnee';

export interface HazardLevelState {
  main: number; // 1-5
  sub: SubLevel;
}

export type SlopeCategory = '<30°' | 'um 30°' | '30-35°' | 'um 35°' | '35-40°' | 'um 40°' | '40-50°';

export interface RiskAssessment {
  level: HazardLevelState;
  slope: SlopeCategory;
  trailBreaking: boolean;
  alarmSigns: 'none' | 'rare' | 'widespread' | null;
  frequentTracks: boolean;
}

export interface ConsequenceAssessment {
  heightAbove: number; // Continuous value from 20 to 100+
  terrainTraps: 'none' | 'slight' | 'pronounced' | null;
  exposedPeople: 1 | 2 | 'group' | null;
}

