import { Injectable } from '@angular/core';
import { Point, Centroid, ClusteredPoint, DatasetShape } from '../models/kmeans.model';

@Injectable({ providedIn: 'root' })
export class KMeansService {
    
  // generate random points
  generatePoints(count: number, shape: DatasetShape = 'random'): Point[] {
    switch (shape) {
      case 'random':
        return this.randomPoints(count);
      case 'blobs':
        return this.blobPoints(count);
      case 'circles':
        return this.circlePoints(count);
      case 'moons':
        return this.moonPoints(count);
      case 'grid':
        return this.gridPoints(count);
      case 'diagonal':
        return this.diagonalPoints(count);
    }
  }

  private randomPoints(count: number): Point[] {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
    }));
  }

  private blobPoints(count: number): Point[] {
    const centers = [
      [-3, -3],
      [3, -3],
      [0, 3],
      [-3, 3],
      [3, 3],
    ];
    return Array.from({ length: count }, (_, i) => {
      const [cx, cy] = centers[i % centers.length];
      return {
        x: cx + this.gaussianRandom() * 0.8,
        y: cy + this.gaussianRandom() * 0.8,
      };
    });
  }

  private circlePoints(count: number): Point[] {
    return Array.from({ length: count }, (_, i) => {
      const radius = i % 2 === 0 ? 2 : 4;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius + this.gaussianRandom() * 0.2,
        y: Math.sin(angle) * radius + this.gaussianRandom() * 0.2,
      };
    });
  }

  private moonPoints(count: number): Point[] {
    const half = Math.floor(count / 2);
    const points: Point[] = [];

    for (let i = 0; i < half; i++) {
      const angle = Math.PI * (i / half);
      points.push({
        x: Math.cos(angle) * 3 + this.gaussianRandom() * 0.3,
        y: Math.sin(angle) * 3 + this.gaussianRandom() * 0.3,
      });
    }
    for (let i = 0; i < count - half; i++) {
      const angle = Math.PI * (i / (count - half));
      points.push({
        x: Math.cos(angle) * 3 + 1.5 + this.gaussianRandom() * 0.3,
        y: -Math.sin(angle) * 3 + 1 + this.gaussianRandom() * 0.3,
      });
    }
    return points;
  }

  private gridPoints(count: number): Point[] {
    const side = Math.ceil(Math.sqrt(count));
    const points: Point[] = [];
    for (let i = 0; i < side && points.length < count; i++) {
      for (let j = 0; j < side && points.length < count; j++) {
        points.push({
          x: (i / side - 0.5) * 8 + this.gaussianRandom() * 0.2,
          y: (j / side - 0.5) * 8 + this.gaussianRandom() * 0.2,
        });
      }
    }
    return points;
  }

  private diagonalPoints(count: number): Point[] {
    return Array.from({ length: count }, () => {
      const t = (Math.random() - 0.5) * 10;
      return {
        x: t + this.gaussianRandom() * 0.5,
        y: t + this.gaussianRandom() * 0.5,
      };
    });
  }

  private gaussianRandom(): number {
    const u = 1 - Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // pick k random points as initial centroids
  initCentroids(points: Point[], k: number): Centroid[] {
    const shuffled = [...points].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k).map((p, i) => ({ id: i, x: p.x, y: p.y }));
  }

  // assign each point to nearest centroid
  assignClusters(points: Point[], centroids: Centroid[]): ClusteredPoint[] {
    return points.map((point) => ({
      ...point,
      centroidId: this.nearestCentroid(point, centroids),
    }));
  }

  // recompute centroids as mean of their assigned points
  updateCentroids(points: ClusteredPoint[], centroids: Centroid[]): Centroid[] {
    return centroids.map((centroid) => {
      const assigned = points.filter((p) => p.centroidId === centroid.id);
      if (assigned.length === 0) return centroid;
      return {
        id: centroid.id,
        x: assigned.reduce((sum, p) => sum + p.x, 0) / assigned.length,
        y: assigned.reduce((sum, p) => sum + p.y, 0) / assigned.length,
      };
    });
  }

  // check if centroids have stopped moving
  hasConverged(prev: Centroid[], next: Centroid[]): boolean {
    return prev.every(
      (c, i) => Math.abs(c.x - next[i].x) < 0.0001 && Math.abs(c.y - next[i].y) < 0.0001,
    );
  }

  private nearestCentroid(point: Point, centroids: Centroid[]): number {
    let minDist = Infinity;
    let nearest = 0;
    for (const c of centroids) {
      const dist = Math.hypot(point.x - c.x, point.y - c.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = c.id;
      }
    }
    return nearest;
  }
}
