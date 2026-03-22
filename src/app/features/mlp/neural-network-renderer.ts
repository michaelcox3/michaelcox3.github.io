import * as THREE from 'three';
import { NeuralNetwork } from './models';
import { BaseRenderer } from './base-renderer';

export class NeuralNetworkRenderer extends BaseRenderer {
  private neuronSpheres: THREE.Mesh[][] = [];
  private connectionLines: THREE.Line[][] = [];

  private neuronRadius = 0.3;
  private layerSpacing = 3;
  private neuronSpacing = 1.5;

  protected override update(): void {
    // No continuous animation needed, so we can leave this empty
  }

  render(network: NeuralNetwork) {
    this.clear();
    this.renderNeurons(network);
    this.centerNetwork(network);
    this.renderConnections(network);
  }

  private clear() {
    this.neuronSpheres.forEach((layer) =>
      layer.forEach((sphere) => {
        sphere.geometry.dispose();
        (sphere.material as THREE.Material).dispose();
        sphere.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
        this.scene.remove(sphere);
      }),
    );
    this.connectionLines.forEach((layer) =>
      layer.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
        this.scene.remove(line);
      }),
    );
    this.neuronSpheres = [];
    this.connectionLines = [];
  }

  private renderNeurons(network: NeuralNetwork) {
    network.layerSizes.forEach((size, layerIndex) => {
      const layerSpheres: THREE.Mesh[] = [];
      for (let i = 0; i < size; i++) {
        const isInput = layerIndex === 0;
        const geometry = new THREE.CircleGeometry(this.neuronRadius, 32);
        const material = new THREE.MeshBasicMaterial({ color: isInput ? 0x888888 : 0x4ecca3 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = layerIndex * this.layerSpacing;
        sphere.position.y = (i - size / 2) * this.neuronSpacing;
        this.scene.add(sphere);
        layerSpheres.push(sphere);
      }
      this.neuronSpheres.push(layerSpheres);
    });
  }

  private renderConnections(network: NeuralNetwork) {
    for (let i = 0; i < this.neuronSpheres.length - 1; i++) {
      const currentSpheres = this.neuronSpheres[i];
      const nextSpheres = this.neuronSpheres[i + 1];
      const layerLines: THREE.Line[] = [];

      currentSpheres.forEach((sphere, ni) => {
        nextSpheres.forEach((nextSphere, nj) => {
          const weight = network.layers[i].neurons[nj].weights[ni].data;
          const magnitude = Math.abs(weight);
          const color = new THREE.Color().setHSL(
            weight > 0 ? 0.6 : 0.0,
            1.0,
            Math.min(0.2 + magnitude * 0.6, 0.8),
          );
          const material = new THREE.LineBasicMaterial({ color, opacity: 0.3, transparent: true });
          const points = [sphere.position.clone(), nextSphere.position.clone()];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geometry, material);
          line.position.z = -0.01; // Slightly behind neurons
          this.scene.add(line);
          layerLines.push(line);
        });
      });
      this.connectionLines.push(layerLines);
    }
  }

  private centerNetwork(network: NeuralNetwork) {
    const totalWidth = (network.layerSizes.length - 1) * this.layerSpacing;
    const widthOffset = totalWidth / 2;
    this.neuronSpheres.forEach((layer) =>
      layer.forEach((sphere) => {
        sphere.position.x -= widthOffset;
      }),
    );
  }
}
