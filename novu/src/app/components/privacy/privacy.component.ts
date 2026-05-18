import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  goToWelcome(): void {
    this.router.navigate(['/']);
  }
}
