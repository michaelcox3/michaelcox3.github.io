import { Value } from "./value";

export interface Optimizer {
  step(parameters: Value[]): void;
}

export class SGD implements Optimizer {
  lr: number;

  constructor(lr: number) {
    this.lr = lr;
  }

  step(parameters: Value[]): void {
    for (const p of parameters) {
      p.data -= this.lr * p.grad;
    }
  }
}

export class SGDMomentum implements Optimizer {
  // the key is the parameter object reference, value is the velocity
  private velocities = new Map<Value, number>();

  constructor(public lr: number, public momentum: number = 0.9) {}

  step(parameters: Value[]): void {
    for (const p of parameters) {
      const v = (this.velocities.get(p) ?? 0) * this.momentum + p.grad;
      this.velocities.set(p, v);
      p.data -= this.lr * v;
    }
  }
}