import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-post-register',
  imports: [],
  templateUrl: './admin-post-accept-request.html',
  styleUrl: './admin-post-accept-request.css'
})
export class AdminPostAcceptRequest {

    constructor(private router: Router) {
    }

    redirectToRegisterRequestList(){
        this.router.navigateByUrl('admin/request');
    }
    redirectToAdminPanel(){
        this.router.navigateByUrl('admin');
    }

    redirectHome(){
        this.router.navigate(['/']);
    }
}
