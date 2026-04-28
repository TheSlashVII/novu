import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import {Router} from '@angular/router';
import {UserAPIService} from '../../services/user-api.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  isLoggedIn:boolean;
  isRestricted:boolean = false;
  error: string | null = null;
    constructor(private router: Router, private userAPI:UserAPIService) {
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
    this.showPassword = !this.showPassword; // toggles between true and false. If it's true, it becomes false and viceversa.
  }

  goToWelcome() {this.router.navigateByUrl('')}
  goToRegister() {this.router.navigateByUrl('/register')}

  submit(): void {
    if (!this.isFormReady) {
      this.formLogin.markAllAsTouched();
      return;
    }
    this.loading = true;
    /*
    setTimeout(() => {
      this.loading = false;
      console.log(this.formLogin.value);
    }, 2000);
     */
      this.error = null;

      this.userAPI.login(this.formLogin.value).subscribe( res => {
          const token:any = res
          this.loading = false;
          if(token.access !=null){
              this.userAPI.saveToken(token.access) // save the token inside the browser
              // console.log(token)
              let route:string = token.is_new == true ? "/studies" : "/home";
                this.isRestricted = token.is_restricted;
              // console.log(this.isRestricted);
              if(!this.isRestricted){
                  this.isRestricted = false;
                  this.router.navigateByUrl(route)
              } else {
                  // console.log(`this account is restricted. Status: ${this.isRestricted}`);
                  localStorage.removeItem("access_token")
              }

          }
          else {
              this.error = "No account was found"
          }

        }
      );

  }

}
