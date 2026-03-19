import { Injectable } from '@angular/core';
import { Point, Centroid, ClusteredPoint, DatasetShape, Range } from '../models/kmeans.model';

@Injectable({ providedIn: 'root' })
export class KMeansService {

  generatePoints(count: number, shape: DatasetShape = 'random', range: Range = { min: -5, max: 5 }): Point[] {
    switch (shape) {
      case 'random':    return this.randomPoints(count, range);
      case 'blobs':     return this.blobPoints(count, range);
      case 'circles':   return this.circlePoints(count, range);
      case 'moons':     return this.moonPoints(count, range);
      case 'grid':      return this.gridPoints(count, range);
      case 'diagonal':  return this.diagonalPoints(count, range);
    }
  }

  // Maps a value from the canonical [-5, 5] space into the given range.
  private s(v: number, range: Range): number {
    const center = (range.min + range.max) / 2;
    const scale = (range.max - range.min) / 10;
    return center + v * scale;
  }

  private randomPoints(count: number, range: Range): Point[] {
    return Array.from({ length: count }, () => ({
      x: this.s((Math.random() - 0.5) * 10, range),
      y: this.s((Math.random() - 0.5) * 10, range),
    }));
  }

  private blobPoints(count: number, range: Range): Point[] {
    const centers = [[-3, -3], [3, -3], [0, 3], [-3, 3], [3, 3]];
    return Array.from({ length: count }, (_, i) => {
      const [cx, cy] = centers[i % centers.length];
      return {
        x: this.s(cx + this.gaussianRandom() * 0.8, range),
        y: this.s(cy + this.gaussianRandom() * 0.8, range),
      };
    });
  }

  private circlePoints(count: number, range: Range): Point[] {
    return Array.from({ length: count }, (_, i) => {
      const radius = i % 2 === 0 ? 2 : 4;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: this.s(Math.cos(angle) * radius + this.gaussianRandom() * 0.2, range),
        y: this.s(Math.sin(angle) * radius + this.gaussianRandom() * 0.2, range),
      };
    });
  }

  private moonPoints(count: number, range: Range): Point[] {
    const half = Math.floor(count / 2);
    const points: Point[] = [];
    for (let i = 0; i < half; i++) {
      const angle = Math.PI * (i / half);
      points.push({
        x: this.s(Math.cos(angle) * 3 + this.gaussianRandom() * 0.3, range),
        y: this.s(Math.sin(angle) * 3 + this.gaussianRandom() * 0.3, range),
      });
    }
    for (let i = 0; i < count - half; i++) {
      const angle = Math.PI * (i / (count - half));
      points.push({
        x: this.s(Math.cos(angle) * 3 + 1.5 + this.gaussianRandom() * 0.3, range),
        y: this.s(-Math.sin(angle) * 3 + 1 + this.gaussianRandom() * 0.3, range),
      });
    }
    return points;
  }

  private gridPoints(count: number, range: Range): Point[] {
    const side = Math.ceil(Math.sqrt(count));
    const points: Point[] = [];
    for (let i = 0; i < side && points.length < count; i++) {
      for (let j = 0; j < side && points.length < count; j++) {
        points.push({
          x: this.s((i / side - 0.5) * 8 + this.gaussianRandom() * 0.2, range),
          y: this.s((j / side - 0.5) * 8 + this.gaussianRandom() * 0.2, range),
        });
      }
    }
    return points;
  }

  private diagonalPoints(count: number, range: Range): Point[] {
    return Array.from({ length: count }, () => {
      const t = (Math.random() - 0.5) * 10;
      return {
        x: this.s(t + this.gaussianRandom() * 0.5, range),
        y: this.s(t + this.gaussianRandom() * 0.5, range),
      };
    });
  }

  private gaussianRandom(): number {
    const u = 1 - Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  initCentroids(points: Point[], k: number): Centroid[] {
    const shuffled = [...points].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k).map((p, i) => ({ id: i, x: p.x, y: p.y }));
  }

  assignClusters(points: Point[], centroids: Centroid[]): ClusteredPoint[] {
    return points.map((point) => ({
      ...point,
      centroidId: this.nearestCentroid(point, centroids),
    }));
  }

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