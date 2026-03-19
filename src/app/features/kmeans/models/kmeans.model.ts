export interface Point {
  x: number;
  y: number;
}

export interface Range {
  min: number;
  max: number;
}

export interface Centroid {
  id: number;
  x: number;
  y: number;
}

export interface ClusteredPoint extends Point {
  centroidId: number;   // which cluster this point belongs to
}

export interface KMeansState {
  points: ClusteredPoint[];
  centroids: Centroid[];
  iteration: number;
  converged: boolean;
}

export type DatasetShape = 'random' | 'blobs' | 'circles' | 'moons' | 'grid' | 'diagonal';