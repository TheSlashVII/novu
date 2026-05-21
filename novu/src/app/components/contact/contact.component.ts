import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { development } from '../../baseURLconfig';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  currentYear = new Date().getFullYear(); 
  private baseUrl = development ? 'http://localhost:8000' : window.location.origin;

  name: string = '';
  email: string = '';
  message: string = '';
  sending: boolean = false;
  success: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  goToWelcome(): void {
    this.router.navigate(['/']);
  }

  submit(): void {
    if(!this.name || !this.email || !this.message) {
      this.errorMessage = 'Por favor rellena todos los campos.';
      return;
    }

    this.sending = true;
    this.errorMessage = '';

    this.http.post(`${this.baseUrl}/api/contact/send/`, {
      name: this.name,
      email: this.email,
      message: this.message
    }).subscribe({
      next: () => {
        this.sending = false;
        this.success = true;
        this.name = '';
        this.email = '';
        this.message = '';
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = 'Ha ocurrido un error. Inténtalo de nuevo.';
        console.error(err);
      }
    });
  }
}
