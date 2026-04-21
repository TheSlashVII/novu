import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-post-register',
  imports: [],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css'
})
export class UnauthorizedComponent {

    constructor(private router: Router) {
    }

    redirectHome(){
        this.router.navigate(['/']);
    }
}
