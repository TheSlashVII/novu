import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.css'
})
export class LegalComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  goToWelcome(): void {
    this.router.navigate(['/']);
  }
}
