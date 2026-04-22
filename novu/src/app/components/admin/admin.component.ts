import { Component } from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {UserAPIService} from '../../services/user-api.service';
import {LoginComponent} from '../login/login.component';

@Component({
  selector: 'app-admin',
    imports: [
        RouterOutlet
    ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
    standalone: true
})
export class AdminComponent {

    // this allows for only authenticated users with admin privilege  to enter this
    isLoggedIn: boolean;
    isAdmin: boolean = false;
    responseStatus:boolean = false;
    constructor(private userAPI:UserAPIService, private router: Router) {
        this.isLoggedIn = this.userAPI.isLoggedIn();
        if (this.isLoggedIn) {
            const token = this.decodeToken()
            this.isAdmin = this.getAdminStatus(Number(token.user_id))
            console.log(this.getAdminStatus(Number(token.user_id)));
        }
        console.log(this.isAdmin);
        if (!this.isAdmin) {
            this.router.navigateByUrl('/unauthorized');
        }
    }

    decodeToken(): any {
        const token = this.userAPI.getToken();
        if (!token) return null;
        // JWT payload is the middle part, Base64 decoded
        return JSON.parse(atob(token.split('.')[1]));
    }
    getAdminStatus(id:number){
         // admin status

        this.userAPI.getUserById(id).subscribe((res:any) => {
            let token = this.decodeToken();
            console.log(res);
            console.log(res.admin);
            let st:boolean = res.admin;
            if(st){
                this.responseStatus = true;
            }
        })
        console.log("status final getAdmin "+ this.responseStatus);
        return this.responseStatus;


    }


}
