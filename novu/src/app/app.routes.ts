import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    {
        path: 'register',
        component: RegisterComponent
    },
    {   path: '', 
        component: WelcomeComponent 
    },
    {
        path: 'login',
        component: LoginComponent
    }
];
