import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-post-register',
  imports: [],
  templateUrl: './admin-post-deny-request.component.html',
  styleUrl: './admin-post-deny-request.component.css'
})
export class AdminPostDenyRequestComponent {

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
