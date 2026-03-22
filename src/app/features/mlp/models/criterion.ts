import { Value } from "./value";

export type Criterion = (predictions: Value[], targets: Value[]) => Value;

// We must use Value instead of number for targets to allow gradients to flow back through the loss function
export function CrossEntropyLoss(predictions: Value[], targets: Value[]): Value {
  // predictions: raw logits [B, C] flattened, targets: one-hot or class indices
  // Here we assume predictions is [C] logits for a single sample,
  // and targets is [C] one-hot encoded

  // Softmax: exp(x_i) / sum(exp(x_j))
  // Numerically stable: subtract max logit before exp (logsumexp trick)
  const maxLogit = Math.max(...predictions.map(p => p.data));

  const shifted = predictions.map(p => p.add(new Value(-maxLogit)));
  const exps = shifted.map(p => p.exp());
  const sumExp = exps.reduce((acc, e) => acc.add(e), new Value(0));

  // log_softmax(x_i) = x_i - max - log(sum(exp(x_j - max)))
  const logSumExp = sumExp.log();
  const logProbs = shifted.map(e => e.sub(logSumExp));

  // Cross entropy = -sum(y_i * log(p_i))
  let loss = new Value(0);
  for (let i = 0; i < predictions.length; i++) {
    loss = loss.add(targets[i].mul(logProbs[i]));
  }
  return loss.neg();
}