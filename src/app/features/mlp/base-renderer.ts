import * as THREE from 'three';

export abstract class BaseRenderer {
  protected renderer!: THREE.WebGLRenderer;
  protected scene!: THREE.Scene;
  protected camera!: THREE.PerspectiveCamera;
  private animationId!: number;

  init(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.camera.position.z = 10;

    this.animate();
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  // Override to implement rendering logic
  protected abstract update(): void;

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}