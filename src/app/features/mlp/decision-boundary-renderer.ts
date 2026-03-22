import { BaseRenderer } from './base-renderer';
import { NeuralNetwork, TrainingData, Value } from './models';
import * as THREE from 'three';

export class DecisionBoundaryRenderer extends BaseRenderer {
  private resolution = 50; // grid samples per axis
  private padding = 0.5;

  render(network: NeuralNetwork, data: TrainingData) {
    this.clear();
    this.renderDecisionBoundary(network, data);
    this.renderTrainingPoints(data);
    this.requestRender();
  }

  private clear() {
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0] as THREE.Mesh;
      child.geometry?.dispose();
      (child.material as THREE.Material)?.dispose();
      this.scene.remove(child);
    }
  }

  private renderDecisionBoundary(network: NeuralNetwork, data: TrainingData) {
    const xs = data.inputs.map(row => row[0]); // xs represent the first feature across all samples
    const ys = data.inputs.map(row => row[1]); // ys represent the second feature across all samples
    const minX = Math.min(...xs) - this.padding;
    const maxX = Math.max(...xs) + this.padding;
    const minY = Math.min(...ys) - this.padding;
    const maxY = Math.max(...ys) + this.padding;

    const stepX = (maxX - minX) / this.resolution;
    const stepY = (maxY - minY) / this.resolution;

    for (let i = 0; i < this.resolution; i++) {
      for (let j = 0; j < this.resolution; j++) {
        const x = minX + i * stepX;
        const y = minY + j * stepY;

        const prediction = network.predict([x, y]);
        const color = prediction === 1 ? 0x4ecca3 : 0xff6b6b;

        const geometry = new THREE.PlaneGeometry(stepX * 1.05, stepY * 1.05);
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
        const cell = new THREE.Mesh(geometry, material);

        cell.position.x = this.mapRange(x, minX, maxX, -5, 5);
        cell.position.y = this.mapRange(y, minY, maxY, -5, 5);
        this.scene.add(cell);
      }
    }
  }

  private renderTrainingPoints(data: TrainingData) {
    data.inputs.forEach((input, idx) => {
      const x = input[0];
      const y = input[1];
      const label = data.targets[idx];

      const xs = data.inputs.map(row => row[0]);
      const ys = data.inputs.map(row => row[1]);
      const minX = Math.min(...xs) - this.padding;
      const maxX = Math.max(...xs) + this.padding;
      const minY = Math.min(...ys) - this.padding;
      const maxY = Math.max(...ys) + this.padding;

      const color = label === 1 ? 0x4ecca3 : 0xff6b6b;
      const geometry = new THREE.CircleGeometry(0.15, 32);
      const material = new THREE.MeshBasicMaterial({ color });
      const point = new THREE.Mesh(geometry, material);

      point.position.x = this.mapRange(x, minX, maxX, -5, 5);
      point.position.y = this.mapRange(y, minY, maxY, -5, 5);
      point.position.z = 0.1; // render on top of grid
      this.scene.add(point);
    });
  }

  private mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  }
}