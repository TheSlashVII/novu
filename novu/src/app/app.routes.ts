import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import {PostRegisterComponent} from './components/post-register/post-register.component';
<<<<<<< HEAD
import { StudiesComponent } from './components/studies/studies.component';
=======
import { InterestsComponent } from './components/interests/interests.component';
>>>>>>> db6d00e7ccc8812291cd2abf59ccf5e77976a5cf

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
<<<<<<< HEAD
        path: 'studies',
        component: StudiesComponent
=======
        path: 'interests',
        component: InterestsComponent
>>>>>>> db6d00e7ccc8812291cd2abf59ccf5e77976a5cf
    }
];
