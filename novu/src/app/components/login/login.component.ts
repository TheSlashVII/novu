import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  showPassword = false;
  loading = false;

  formLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get isFormReady(): boolean {
    return this.formLogin.valid;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (!this.isFormReady) {
      this.formLogin.markAllAsTouched();
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      console.log(this.formLogin.value);
    }, 2000);
  }
}