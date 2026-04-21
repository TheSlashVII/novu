import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import {PostRegisterComponent} from './components/post-register/post-register.component';
import {AdminPanelComponent} from './components/admin-panel/admin-panel.component';
import {
    AdminRegisterRequestListComponent
} from './components/admin-register-request-list/admin-register-request-list.component';
import {AdminComponent} from './components/admin/admin.component';

import { StudiesComponent } from './components/studies/studies.component';

import { InterestsComponent } from './components/interests/interests.component';
import {AdminRegisterRequestDetailComponent} from './components/admin-register-request-detail/admin-register-request-detail.component'
import { HomeComponent } from './components/home/home.component';
import {AdminPostAcceptRequest} from './components/admin-post-accept-request/admin-post-accept-request';
import {NotFoundComponent} from './components/not-found/not-found.component';


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
        component: LoginComponent,
        title: "Novu - Login"
    },
    {
        path: 'postRegister',
        component: PostRegisterComponent
    },
    {
        path: 'studies',
        component: StudiesComponent
    },
    {
        path: 'interests',
        component: InterestsComponent
    },
    {
    path: 'admin',
        component: AdminComponent,
        title: "Admin Panel",
        children: [
            {path:'', component: AdminPanelComponent, pathMatch: 'full'},
            {path:'request', component: AdminRegisterRequestListComponent},
            {
                path: 'detail/request/:id',
                component: AdminRegisterRequestDetailComponent,
                title: "Admin - Register Request",
            },{
                path:"post/accept", component: AdminPostAcceptRequest,
            }
        ]
    },
    {
        path: 'home',
        component: HomeComponent
    },{
    path: '**',
        component: NotFoundComponent
    }


];
