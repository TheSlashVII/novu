import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UserAPIService } from '../../services/user-api.service';

@Component({
  selector: 'app-studies',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './studies.component.html',
  styleUrl: './studies.component.css'
})
export class StudiesComponent {
  constructor(private router:Router){}

  currentYear: number = new Date().getFullYear();

  studiesName: string = '';

  goNext(): void {
    
    this.router.navigate(['/interests']); 
  }
}
