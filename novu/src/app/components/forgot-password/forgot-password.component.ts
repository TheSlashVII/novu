import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAPIService } from '../../services/user-api.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  loading = false;
  emailSent = false;
  error: string | null = null;

  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')])
  })

  constructor(private router: Router, private userAPI: UserAPIService){}

  submit(): void {
    if(!this.forgotForm.valid){
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    this.userAPI.requestPasswordReset(this.forgotForm.value.email!).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
      },
      error: (err) => {
        this.loading = false;
        // Por seguridad mostramos el mismo mensaje aunque el email no exista
        // (para no revelar qué emails están registrados)
        this.emailSent = true;
        console.error(err);
      }
    });
  }

  resetForm(): void {
    this.emailSent = false;
    this.error = null;
    this.forgotForm.reset();
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  goToWelcome(): void {
    this.router.navigateByUrl('');
  }
}
