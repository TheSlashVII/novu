import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-studies',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './studies.component.html',
  styleUrl: './studies.component.css'
})
export class StudiesComponent {
  private router = inject(Router);

  currentYear: number = new Date().getFullYear();

  studiesName: string = '';

  goNext(): void {
    this.router.navigate(['/']); 
  }
}
