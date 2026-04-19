import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import {PostRegisterComponent} from './components/post-register/post-register.component';
import { StudiesComponent } from './components/studies/studies.component';

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
    }, 
    {
        path: 'postRegister',
        component: PostRegisterComponent
    },
    {
        path: 'studies',
        component: StudiesComponent
    }
];
