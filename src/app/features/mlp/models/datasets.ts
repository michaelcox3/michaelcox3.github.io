import { TrainingData } from './trainer';

export type DatasetType = 'xor' | 'circle' | 'random';

function randn(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function generateDataset(type: DatasetType, n: number = 100): TrainingData {
  const inputs: number[][] = [];
  const targets: number[] = [];
  const half = Math.floor(n / 2);

  switch (type) {
    case 'xor': {
      const std = 0.05;
      const class0 = [
        { cx: 0.25, cy: 0.25 },
        { cx: 0.75, cy: 0.75 },
      ];
      const class1 = [
        { cx: 0.25, cy: 0.75 },
        { cx: 0.75, cy: 0.25 },
      ];
      for (let i = 0; i < half; i++) {
        const c = class0[i % 2];
        inputs.push([clamp(c.cx + randn() * std, 0, 1), clamp(c.cy + randn() * std, 0, 1)]);
        targets.push(0);
      }
      for (let i = 0; i < n - half; i++) {
        const c = class1[i % 2];
        inputs.push([clamp(c.cx + randn() * std, 0, 1), clamp(c.cy + randn() * std, 0, 1)]);
        targets.push(1);
      }
      break;
    }
    case 'circle': {
      for (let i = 0; i < half; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = Math.random() * 0.15;
        inputs.push([0.5 + r * Math.cos(theta), 0.5 + r * Math.sin(theta)]);
        targets.push(1);
      }
      for (let i = 0; i < n - half; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = 0.35 + Math.random() * 0.14;
        inputs.push([
          clamp(0.5 + r * Math.cos(theta), 0, 1),
          clamp(0.5 + r * Math.sin(theta), 0, 1),
        ]);
        targets.push(0);
      }
      break;
    }
    case 'random': {
      for (let i = 0; i < half; i++) {
        inputs.push([Math.random(), Math.random()]);
        targets.push(0);
      }
      for (let i = 0; i < n - half; i++) {
        inputs.push([Math.random(), Math.random()]);
        targets.push(1);
      }
      break;
    }
  }

  return { inputs, targets };
}
