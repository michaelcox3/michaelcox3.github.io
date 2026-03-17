import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { PROJECTS } from '../../shared/models/project';

@Component({
  selector: 'app-project-detail',
  imports: [NgComponentOutlet],
  templateUrl: './project-detail.html',
})
export class ProjectDetailComponent {
  private route = inject(ActivatedRoute);
  projectComponent = signal<any>(null);
  loading = signal(true);

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    const project = PROJECTS.find((p) => p.slug === slug);
    if (project) {
      this.projectComponent.set(await project.component());
    }
    this.loading.set(false);
  }
}
