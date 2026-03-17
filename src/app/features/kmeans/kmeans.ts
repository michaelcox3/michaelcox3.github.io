import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  AfterViewInit,
  signal,
} from '@angular/core';
import * as THREE from 'three';
import { KMeansService } from './services/kmeans.service';
import { DatasetShape, KMeansState } from './models/kmeans.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kmeans',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './kmeans.html',
})
export class KMeansComponent implements OnInit, OnDestroy {
  private kmeans = inject(KMeansService);
  state = signal<KMeansState>({ points: [], centroids: [], iteration: 0, converged: false });
  k = signal(3);
  shape = signal<DatasetShape>('random');

  readonly MIN_K = 2;
  readonly MAX_K = 8;
  readonly SHAPES: { value: DatasetShape; label: string }[] = [
    { value: 'random', label: 'Random' },
    { value: 'blobs', label: 'Blobs' },
    { value: 'circles', label: 'Circles' },
    { value: 'moons', label: 'Moons' },
    { value: 'grid', label: 'Grid' },
    { value: 'diagonal', label: 'Diagonal' },
  ];

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId!: number;
  private pointCloud!: THREE.Points;
  private centroidCloud!: THREE.Points;

  ngOnInit() {
    this.initThree();
    this.reset();
    this.animate();
  }

  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight - 180;

    // renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 10;
  }

  step() {
    if (this.state().converged) return;

    const newCentroids = this.kmeans.updateCentroids(this.state().points, this.state().centroids);
    const newPoints = this.kmeans.assignClusters(this.state().points, newCentroids);
    const converged = this.kmeans.hasConverged(this.state().centroids, newCentroids);

    this.state.set({
      points: newPoints,
      centroids: newCentroids,
      iteration: this.state().iteration + 1,
      converged,
    });

    this.render();
  }

  reset() {
    const points = this.kmeans.generatePoints(100, this.shape());
    const centroids = this.kmeans.initCentroids(points, this.k());
    this.state.set({
      points: this.kmeans.assignClusters(points, centroids),
      centroids,
      iteration: 0,
      converged: false,
    });
    this.render();
  }

  private render() {
    this.renderPoints();
    this.renderCentroids();
  }

  private renderPoints() {
    const positions = new Float32Array(this.state().points.length * 3);
    const colors = new Float32Array(this.state().points.length * 3);

    const palette = [
      new THREE.Color(0xff6b6b),
      new THREE.Color(0x6bcbff),
      new THREE.Color(0x6bff8e),
      new THREE.Color(0xffd36b),
      new THREE.Color(0xd36bff),
      new THREE.Color(0xff9f43),
      new THREE.Color(0xa29bfe),
      new THREE.Color(0xfd79a8),
    ];

    this.state().points.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = 0;

      const color = palette[p.centroidId % palette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });

    if (this.pointCloud) this.scene.remove(this.pointCloud);
    this.pointCloud = new THREE.Points(geometry, material);
    this.scene.add(this.pointCloud);
  }

  private renderCentroids() {
    const centroids = this.state().centroids;
    const positions = new Float32Array(centroids.length * 3);
    const colors = new Float32Array(centroids.length * 3);

    const palette = [
      new THREE.Color(0xff6b6b),
      new THREE.Color(0x6bcbff),
      new THREE.Color(0x6bff8e),
      new THREE.Color(0xffd36b),
      new THREE.Color(0xd36bff),
      new THREE.Color(0xff9f43),
      new THREE.Color(0xa29bfe),
      new THREE.Color(0xfd79a8),
    ];

    centroids.forEach((c, i) => {
      positions[i * 3] = c.x;
      positions[i * 3 + 1] = c.y;
      positions[i * 3 + 2] = 0;

      const color = palette[i % palette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3, // bigger than regular points
      vertexColors: true,
      sizeAttenuation: true,
    });

    if (this.centroidCloud) this.scene.remove(this.centroidCloud);
    this.centroidCloud = new THREE.Points(geometry, material);
    this.scene.add(this.centroidCloud);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  onKChange(value: number) {
    const clamped = Math.min(Math.max(value, this.MIN_K), this.MAX_K);
    this.k.set(clamped);
    this.reset();
  }

  onShapeChange(value: DatasetShape) {
    this.shape.set(value);
    this.reset();
  }
}
