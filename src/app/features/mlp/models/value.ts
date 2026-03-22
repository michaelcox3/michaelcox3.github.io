type ValueOp = '+' | '*' | 'pow' | 'exp' | 'log' | 'neg' | 'relu' | 'sigmoid' | '';

// Value class represents a scalar value with automatic differentiation capabilities
export class Value {
  data: number;
  grad: number = 0;
  _backward: () => void = () => {};
  _prev: Set<Value>;
  _op: ValueOp;

  constructor(data: number, _children: Value[] = [], _op: ValueOp = '') {
    this.data = data;
    this._prev = new Set(_children);
    this._op = _op;
  }

  add(other: Value): Value {
    const out = new Value(this.data + other.data, [this, other], '+');
    out._backward = () => {
      this.grad += out.grad;
      other.grad += out.grad;
    };
    return out;
  }

  sub(other: Value): Value {
    return this.add(other.neg());
  }

  mul(other: Value): Value {
    const out = new Value(this.data * other.data, [this, other], '*');
    out._backward = () => {
      this.grad += other.data * out.grad;
      other.grad += this.data * out.grad;
    };
    return out;
  }

  neg(): Value {
    const out = new Value(-this.data, [this], 'neg');
    out._backward = () => {
      this.grad += -1 * out.grad;
    };
    return out;
  }

  pow(n: number): Value {
    const out = new Value(Math.pow(this.data, n), [this], 'pow');
    out._backward = () => {
      this.grad += n * Math.pow(this.data, n - 1) * out.grad; // d/dx x^n = n*x^(n-1)
    };
    return out;
  }

  exp(): Value {
    const out = new Value(Math.exp(this.data), [this], 'exp');
    out._backward = () => {
      this.grad += out.data * out.grad; // d/dx e^x = e^x
    };
    return out;
  }

  log(): Value {
    const out = new Value(Math.log(this.data), [this], 'log');
    out._backward = () => {
      this.grad += (1 / this.data) * out.grad;
    };
    return out;
  }

  relu(): Value {
    const out = new Value(Math.max(0, this.data), [this], 'relu');
    out._backward = () => {
      this.grad += (out.data > 0 ? 1 : 0) * out.grad;
    };
    return out;
  }

  sigmoid(): Value {
    const s = 1 / (1 + Math.exp(-this.data));
    const out = new Value(s, [this], 'sigmoid');
    out._backward = () => {
      this.grad += s * (1 - s) * out.grad;
    };
    return out;
  }

  // Topological sort + reverse pass
  backward() {
    const topo: Value[] = [];
    const visited = new Set<Value>();

    const build = (v: Value) => {
      if (visited.has(v)) return;
      visited.add(v);
      v._prev.forEach(build);
      topo.push(v);
    };

    build(this);
    this.grad = 1; // dL/dL = 1
    topo.reverse().forEach((v) => v._backward());
  }
}
