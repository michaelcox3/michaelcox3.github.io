import { Type } from '@angular/core';

export interface Project {
  slug: string;
  title: string;
  summary: string;
  publishDate: Date;
  component: () => Promise<Type<unknown>>;
}

export const PROJECTS: Project[] = [
  {
    slug: 'mlp-classifier-visualization',
    title: 'Multi-Layer Perceptron Classifier Visualization',
    summary: 'Train a simple MLP on 2D datasets and visualize the decision boundary and network structure.',
    publishDate: new Date('2026-03-21'),
    component: () => import('../../features/mlp/mlp').then((m) => m.MLPComponent),
  },
  {
    slug: 'kmeans-visualizer',
    title: 'KMeans Visualizer',
    summary: 'A tool to visualize the KMeans clustering algorithm.',
    publishDate: new Date('2026-03-16'),
    component: () => import('../../features/kmeans/kmeans').then((m) => m.KMeansComponent),
  },
];
