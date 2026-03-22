import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  CrossEntropyLoss,
  Classifier,
  ClassificationTrainer,
  DatasetType,
  generateDataset,
  SGDMomentum,
} from './models';
import { NeuralNetworkRenderer } from './neural-network-renderer';
import { DecisionBoundaryRenderer } from './decision-boundary-renderer';

@Component({
  selector: 'app-mlp',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './mlp.html',
})
export class MLPComponent implements OnInit, OnDestroy {
  // Architecture and hyperparameters
  layers = signal([2, 4, 4, 2]);
  learningRate = signal(0.01);
  batchSize = signal(1);

  // Data
  dataSize = signal(10);
  datasetType = signal<DatasetType>('xor');
  data = generateDataset(this.datasetType(), this.dataSize());

  // Model
  network = new Classifier(this.layers());
  optimizer = new SGDMomentum(this.learningRate());
  trainer = new ClassificationTrainer(
    this.network,
    CrossEntropyLoss,
    this.optimizer,
    this.data,
    this.batchSize(),
  );

  // Training state
  state = signal({ iteration: 0, converged: false, loss: 0 });
  training = signal(false);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  // Network visualization
  @ViewChild('neuralnetworkcanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private neuralNetworkRenderer = new NeuralNetworkRenderer();

  // Decision boundary visualization
  @ViewChild('decisionboundarycanvas', { static: true })
  decisionBoundaryCanvasRef!: ElementRef<HTMLCanvasElement>;
  private decisionBoundaryRenderer = new DecisionBoundaryRenderer();

  ngOnInit() {
    this.neuralNetworkRenderer.init(this.canvasRef.nativeElement);
    this.decisionBoundaryRenderer.init(this.decisionBoundaryCanvasRef.nativeElement);
    window.addEventListener('resize', this.onResize);
    this.onResize();
    this.reset();
  }

  ngOnDestroy() {
    this.stopTraining();
    this.neuralNetworkRenderer.dispose();
    this.decisionBoundaryRenderer.dispose();
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = () => {
    const width = this.canvasRef.nativeElement.clientWidth;
    const height = Math.min(width, window.innerHeight / 2);
    this.neuralNetworkRenderer.resize(width, height);
    this.decisionBoundaryRenderer.resize(width, height);
  };

  reset(): void {
    this.stopTraining();
    this.createTrainer();
    this.state.set({ iteration: 0, converged: false, loss: 0 });
    this.neuralNetworkRenderer.render(this.network);
    this.decisionBoundaryRenderer.render(this.network, this.data);
  }

  step(): void {
    if (this.state().converged) return;
    const loss = this.trainer.step();
    const iteration = this.state().iteration + 1;
    const converged = loss < 0.01;
    this.state.set({ iteration, converged, loss });
    this.neuralNetworkRenderer.render(this.network);
    this.decisionBoundaryRenderer.render(this.network, this.data);
  }

  startTraining() {
    if (this.training()) return;
    this.training.set(true);
    this.intervalId = setInterval(() => {
      if (!this.training() || this.state().converged) {
        this.stopTraining();
        return;
      }
      this.step();
    }, 100);
  }

  stopTraining() {
    this.training.set(false);
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  createTrainer() {
    this.network = new Classifier(this.layers());
    this.optimizer = new SGDMomentum(this.learningRate());
    this.trainer = new ClassificationTrainer(
      this.network,
      CrossEntropyLoss,
      this.optimizer,
      this.data,
      this.batchSize(),
    );
  }

  regenerateData() {
    this.data = generateDataset(this.datasetType(), this.dataSize());
    this.trainer.setData(this.data); // Update trainer with new data, don't reset model weights
    this.neuralNetworkRenderer.render(this.network);
    this.decisionBoundaryRenderer.render(this.network, this.data);
  }

  selectDatasetSize(size: number) {
    this.dataSize.set(size);
    this.regenerateData();
  }

  selectDataset(type: DatasetType) {
    this.datasetType.set(type);
    this.regenerateData();
  }

  selectLearningRate(rate: number) {
    this.learningRate.set(rate);
    this.reset();
  }

  selectBatchSize(size: number) {
    this.batchSize.set(size);
    this.reset();
  }
}
