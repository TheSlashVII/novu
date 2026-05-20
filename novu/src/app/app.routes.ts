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
import {AdminUpdateUserListComponent} from './components/admin-update-user-list/admin-update-user-list.component';
import { RelationPreferencesComponent } from './components/relation-preferences/relation-preferences.component';
import { LegalComponent } from './components/legal/legal.component';



export const routes: Routes = [
    {   path: '',
        component: WelcomeComponent
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: "Novu - Register"
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
        path: 'relationship-preferences',
        component: RelationPreferencesComponent
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
        path: 'chats', component: ChatListComponent,
        title:"Novu - Chats"
    },
    {
        path: 'chat/:id', component: ChatDetailComponent,
        title:"Novu - Chat"
    },

    //Route admin
    {
    path: 'admin',
        component: AdminComponent,
        title: "Admin Panel",
        children: [
            {path:'', component: AdminPanelComponent, pathMatch: 'full'},
            {
                path:'request',
                component: AdminRegisterRequestListComponent,
                title:"Novu Admin - Register Request (List)"
            },
            {
                path: 'detail/request/:id',
                component: AdminRegisterRequestDetailComponent,
                title: "Novu Admin - Register Request",
            },{
                path:"post_accept", component: AdminPostAcceptRequest,
                title: "Novu Admin - Accept",
            }, {
                path:"post_deny", component: AdminPostDenyRequestComponent,
                title: "Novu Admin - Deny Request",
            },{
                path:'restrict_user',
                component: AdminRestrictUserComponent,
                title: "Novu Admin - Restrict User (List)",
            },
            {
                path:'restrict_user/detail/:id',
                component: AdminRestrictUserDetailComponent,
                title:'Novu Admin - Restrict User Detail',
            },{
                path:'delete_user',
                component: AdminDeleteUserComponent,
                title:'Novu Admin - Delete User',
            },
             {
                path:"create_user", component: AdminCreateUsersComponent,
                title: "Novu Admin - Create User",
            },{
                path:'update/:id',
                component:AdminUpdateUsersComponent,
                title: "Novu Admin - Update User Detail",
            }, {
                path:'update_user',
                component:AdminUpdateUserListComponent,
                title: "Novu Admin - Update User (List)",
            }
        ]
    },{
        path: 'card_creation',
        component: CardCreationComponent,
    },
    {
        path: 'legal',
        component: LegalComponent,
        title: 'Novu - Aviso Legal'
    },
    {
        path:'unauthorized',
        component: UnauthorizedComponent
    },
    {
    path: '**',
        component: NotFoundComponent
    },
];
