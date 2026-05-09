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
import {UnauthorizedComponent} from './components/unauthorized/unauthorized';
import {AdminCreateUsersComponent} from './components/admin-create-users/admin-create-users.component';
import {AdminPostDenyRequestComponent} from './components/admin-post-deny-request/admin-post-deny-request.component';
import {AdminRestrictUserComponent} from './components/admin-restrict-user/admin-restrict-user.component';
import {
    AdminRestrictUserDetailComponent
} from './components/admin-restrict-user-detail/admin-restrict-user-detail.component';
import {AdminDeleteUserComponent} from './components/admin-delete-user/admin-delete-user.component';
import {CardCreationComponent} from './components/card-creation/card-creation.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatDetailComponent } from './components/chat-detail/chat-detail.component';

import {GenderComponent} from './components/gender/gender.component';
import {SettingsComponent} from './components/settings/settings.component';
import { AdminUpdateUsersComponent } from './components/admin-update-users/admin-update-users.component';

export const routes: Routes = [
    {   path: '',
        component: WelcomeComponent,
        title: "Novu - Home"
    },
    {
        path: 'register',
        component: RegisterComponent
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
    },{
        path:'gender',
        component: GenderComponent,
    },{
        path: 'home',
        component: HomeComponent,
        title: "Novu - Home",
    },{
        path:'settings',
        component:SettingsComponent,
        title:"Novu - Settings",
    },
    {
        path: 'home',
        component: HomeComponent
    },{
        path:'unauthorized',
        component: UnauthorizedComponent
    },
    {
        path: 'chats', component: ChatListComponent
    },
    {
        path: 'chat/:id', component: ChatDetailComponent
    },

    //Route admin
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
                path:"post_accept", component: AdminPostAcceptRequest,
            }, {
                path:"post_deny", component: AdminPostDenyRequestComponent
            },{
                path:'restrict_user',
                component: AdminRestrictUserComponent
            },
            {
                path:'restrict_user/detail/:id',
                component: AdminRestrictUserDetailComponent,
            },{
                path:'delete_user',
                component: AdminDeleteUserComponent,
                title:'Novu Admin - Delete User',
            },
             {
                path:"create_user", component: AdminCreateUsersComponent
            }
        ]
    },{
        path: 'card_creation',
        component: CardCreationComponent,
    },{
        path:'unauthorized',
        component: UnauthorizedComponent
    },{
        path:'update/:id',
        component:AdminUpdateUsersComponent
    },
    {
    path: '**',
        component: NotFoundComponent
    },
];
