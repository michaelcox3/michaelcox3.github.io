import { ActivationFn, Neuron } from "./neuron";
import { Value } from "./value";

export class Layer {
  neurons: Neuron[];

  constructor(inputSize: number, outputSize: number, activation: ActivationFn | null = null) {
    this.neurons = Array.from(
      { length: outputSize },
      () => new Neuron(inputSize, activation)
    );
  }

  // Returns the output of all neurons in this layer for a given input
  forward(inputs: Value[]): Value[] {
    return this.neurons.map(neuron => neuron.forward(inputs));
  }

  parameters(): Value[] {
    return this.neurons.flatMap(neuron => neuron.parameters());
  }
}