import { Type } from '@angular/core';

export interface Project {
  slug?: string;
  title: string;
  summary: string;
  publishDate: Date;
  externalUrl?: string;
  component?: () => Promise<Type<unknown>>;
}

export const PROJECTS: Project[] = [
  {
    title: 'LLM Chess Bench',
    summary: 'Watch large language models play chess against each other and analyze their moves.',
    publishDate: new Date(2026, 3, 5),
    externalUrl: 'https://www.llmchessbench.com/'
  },
  {
    slug: 'mlp-classifier-visualization',
    title: 'Multi-Layer Perceptron Classifier Visualization',
    summary: 'Train a simple MLP on 2D datasets and visualize the decision boundary and network structure.',
    publishDate: new Date(2026, 2, 21),
    component: () => import('../../features/mlp/mlp').then((m) => m.MLPComponent),
  },
  {
    title: 'CS 7641: Supervised Learning Report',
    summary: 'Tuned and benchmarked four supervised learning models (Decision Tree, KNN, SVM, MLP) using validation curves for hyperparameter optimization and evaluated performance via F1 score across the Adult Census Income and Wine Quality datasets.',
    publishDate: new Date(2026, 1, 23),
    externalUrl: 'https://github.com/michaelcox3/cs-7641-sl-report'
  },
  {
    title: 'Rubiks RL Solver',
    summary: "Rubiks-RL is a reinforcement learning project to solve a Rubik's Cube using Deep Q-Networks (DQN)",
    publishDate: new Date(2025, 7, 24),
    externalUrl: 'https://github.com/michaelcox3/rubiks-rl'
  },
  {
    title: 'IAI Slide Driver',
    summary: '.NET Driver that controls PCON / SCON slides from IAI America',
    publishDate: new Date(2023, 2, 6),
    externalUrl: 'https://github.com/michaelcox3/IAI-Slide-Driver'
  }
];
