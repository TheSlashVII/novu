import { Component } from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {UserAPIService} from '../../services/user-api.service';

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

    // this allows for only authenticated users with admin privilege to enter the admin panel its child sites
    isLoggedIn: boolean;
    isAdmin: boolean = false;
    constructor(private userAPI:UserAPIService, private router: Router) {
        this.isLoggedIn = this.userAPI.isLoggedIn();
        if (this.isLoggedIn) {
            const token = this.decodeToken()
            const isTokenExpired = this.isTokenExpired(this.userAPI.getToken()!); // will check if the token is expired
            console.log(isTokenExpired)

            this.getAdminStatus(Number(token.user_id))
            console.log(this.isAdmin)
            // will deny access if you are not an authorized admin
            if (isTokenExpired) {
                this.router.navigateByUrl('/unauthorized');

            }
        } else{
            this.router.navigateByUrl('/unauthorized');
            localStorage.removeItem('access_token');
        }

    }

    decodeToken(): any {
        const token = this.userAPI.getToken();
        if (!token) return null;
        // JWT payload is the middle part, Base64 decoded
        return JSON.parse(atob(token.split('.')[1]));
    }
    getAdminStatus(id:number){
        this.userAPI.getUserById(id).subscribe((res:any) => {
            this.isAdmin = res.admin;
            if (!this.isAdmin) {
                this.router.navigateByUrl('/unauthorized');
            }
        })

    }
    isTokenExpired(token: string): boolean {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Date.now() / 1000;
    }


}
