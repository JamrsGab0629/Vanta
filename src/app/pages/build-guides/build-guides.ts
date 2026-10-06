import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-build-guide',
  standalone: true,
  templateUrl: './build-guides.html',
  styleUrl: './build-guides.css'
})
export class BuildGuide {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/app/home']);
  }
}