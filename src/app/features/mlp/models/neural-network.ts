import { Layer } from './layer';
import { ActivationFn } from './neuron';
import { Value } from './value';

export abstract class NeuralNetwork {
  layers: Layer[];
  layerSizes: number[];

  constructor(layerSizes: number[], activation: ActivationFn | null = (v) => v.relu()) {
    this.layerSizes = layerSizes;
    this.layers = [];
    for (let i = 0; i < layerSizes.length - 1; i++) {
      const isLastLayer = i === layerSizes.length - 2;
      this.layers.push(
        new Layer(layerSizes[i], layerSizes[i + 1], isLastLayer ? null : activation),
      );
    }
  }

  forward(inputs: Value[]): Value[] {
    let current = inputs;
    for (const layer of this.layers) {
      current = layer.forward(current);
    }
    return current;
  }

  abstract predict(inputs: number[]): number;

  parameters(): Value[] {
    return this.layers.flatMap((layer) => layer.parameters());
  }
}

export class Regressor extends NeuralNetwork {
  predict(inputs: number[]): number {
    const logits = this.forward(inputs.map(i => new Value(i)));
    return logits[0].data;
  }
}

export class Classifier extends NeuralNetwork {
  predict(inputs: number[]): number {
    const logits = this.forward(inputs.map(i => new Value(i)));
    return logits
      .map((v, i) => ({ score: v.data, index: i }))
      .reduce((best, curr) => (curr.score > best.score ? curr : best)).index;
  }
}
