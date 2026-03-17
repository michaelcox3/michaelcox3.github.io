import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Project, PROJECTS } from '../../shared/models/project';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
})
export class HomeComponent {
  projects: Project[] = PROJECTS;
}