import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAPIService } from '../../services/user-api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  isLoggedIn: boolean;
  isRestricted: boolean = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private userAPI: UserAPIService,
    private notificationService: NotificationService
  ) {
    this.isLoggedIn = this.userAPI.isLoggedIn();
    if (this.userAPI.isLoggedIn()) {
      this.router.navigateByUrl('home');
    }
  }

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

  goToWelcome() { this.router.navigateByUrl(''); }
  goToRegister() { this.router.navigateByUrl('/register'); }

  submit(): void {
    if (!this.isFormReady) {
      this.formLogin.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;

    this.userAPI.login(this.formLogin.value).subscribe(res => {
      const token: any = res;
      this.loading = false;
      if (token.access != null) {
        this.userAPI.saveToken(token.access);
        
        // Conectar notificaciones después del login
        this.notificationService.connect();

        this.isRestricted = token.is_restricted;
        let route: string = token.is_new == true ? "/studies" : "/home";
        this.router.navigateByUrl(route);
      }
    });
  }
}