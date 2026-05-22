import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAPIService } from '../../services/user-api.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  loading = false;
  tokenInvalid = false;
  passwordReset = false;
  showPassword = false;
  showConfirmPassword = false;
  error: string | null = null;

  private token: string = '';
  private uid: string = '';

  resetForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  })

  get PasswordsMatch(): boolean {
    return this.resetForm.value.password === this.resetForm.value.confirmPassword;
  }

  constructor(private router: Router, private route: ActivatedRoute, private userAPI: UserAPIService ) {}

  ngOnInit(): void {
    // El enlace llega como: /reset-password?uid=XXXX&token=YYYY
    this.uid = this.route.snapshot.queryParamMap.get('uid') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if(!this.uid || !this.token){
      this.tokenInvalid = true;
      return;
    }

    // Verificar el token contra el backend antes de mostrar el formulario
    this.userAPI.validateResetToken(this.uid, this.token).subscribe({
      next: () => {
        /* token válido, mostrar formulario */
      },
      error: () => {this.tokenInvalid = true;}
    })
  }

  submit(): void {
    if(!this.resetForm.valid || !this.PasswordsMatch) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const newPassword = this.resetForm.value.password!;

    this.userAPI.confirmPasswordReset(this.uid, this.token, newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.passwordReset = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error ?? 'Algo salio mal. Intentalo de nuevo.';
      }
    })
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  goToForgotPassword(): void {
    this.router.navigateByUrl('/forgot-password');
  }

  goToWelcome(): void {
    this.router.navigateByUrl('');
  }

}
