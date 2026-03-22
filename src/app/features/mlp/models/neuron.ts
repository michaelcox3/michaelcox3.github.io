import { Value } from "./value";

export type ActivationFn = (v: Value) => Value;

export class Neuron {
  weights: Value[];
  bias: Value;
  activation: ActivationFn | null;

  constructor(inputSize: number, activation: ActivationFn | null = null) {
    const scale = Math.sqrt(2 / inputSize);
    this.weights = Array.from(
      { length: inputSize },
      () => new Value((Math.random() * 2 - 1) * scale),
    );
    this.bias = new Value(0);
    this.activation = activation;
  }

  // Computes w0*x0 + w1*x1 + ... + b and applies activation function if specified
  forward(inputs: Value[]): Value {
    if (inputs.length !== this.weights.length) {
      throw new Error(`Expected ${this.weights.length} inputs, got ${inputs.length}`);
    }

    let act = new Value(0);
    for (let i = 0; i < this.weights.length; i++) {
      act = act.add(this.weights[i].mul(inputs[i]));
    }
    act = act.add(this.bias);
    return this.activation ? this.activation(act) : act;
  }

  parameters(): Value[] {
    return [...this.weights, this.bias];
  }
}
