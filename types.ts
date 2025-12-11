export enum AppState {
  TREE = 0,
  EXPLODED = 1,
  TEXT = 2
}

export interface PositionData {
  tree: Float32Array;
  exploded: Float32Array;
  text: Float32Array;
  colors: Float32Array;
}

export interface ParticleConfig {
  count: number;
  colorPalette: string[];
}