import { Criterion } from './criterion';
import { NeuralNetwork } from './neural-network';
import { Optimizer } from './optimizer';
import { Value } from './value';

export interface TrainingData {
  inputs: number[][];
  targets: number[];
}

export abstract class Trainer {
  constructor(
    protected network: NeuralNetwork,
    protected criterion: Criterion,
    protected optimizer: Optimizer,
    protected data: TrainingData,
    protected batchSize: number = 1,
  ) {}

  setData(data: TrainingData) {
    this.data = data;
  }

  abstract step(): number;

  train(epochs: number) {
    for (let epoch = 0; epoch < epochs; epoch++) {
      const loss = this.step();
      console.log(`Epoch ${epoch + 1}/${epochs}, Loss: ${loss.toFixed(4)}`);
    }
  }

  protected backward(loss: Value) {
    for (const p of this.network.parameters()) p.grad = 0;
    loss.backward();
    this.optimizer.step(this.network.parameters());
  }
}

export class ClassificationTrainer extends Trainer {
  private encodeTarget(i: number): Value[] {
    // Last layer size determines number of classes
    const numClasses = this.network.layers[this.network.layers.length - 1].neurons.length;
    const oneHot = new Array(numClasses).fill(0);
    oneHot[this.data.targets[i]] = 1;
    return oneHot.map((v: number) => new Value(v));
  }

  step(): number {
    // Shuffle indices for stochasticity
    const indices = [...Array(this.data.inputs.length).keys()].sort(() => Math.random() - 0.5);

    let totalLoss = 0;
    for (let i = 0; i < indices.length; i += this.batchSize) {
      const batch = indices.slice(i, i + this.batchSize);

      const inputs = batch.map((j) => this.data.inputs[j].map((x) => new Value(x)));
      const targets = batch.map((j) => this.encodeTarget(j));

      const predictions = inputs.map((input) => this.network.forward(input));
      const losses = predictions.map((pred, k) => this.criterion(pred, targets[k]));
      const loss = losses
        .reduce((acc, l) => acc.add(l), new Value(0))
        .mul(new Value(1 / losses.length));

      for (const p of this.network.parameters()) p.grad = 0;
      loss.backward();
      this.optimizer.step(this.network.parameters());

      totalLoss += loss.data;
    }

    return totalLoss / Math.ceil(this.data.inputs.length / this.batchSize);
  }
}
