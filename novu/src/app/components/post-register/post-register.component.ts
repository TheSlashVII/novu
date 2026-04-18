import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-post-register',
  imports: [],
  templateUrl: './post-register.component.html',
  styleUrl: './post-register.component.css'
})
export class PostRegisterComponent {

    constructor(private router: Router) {
    }

    redirectHome(){
        this.router.navigate(['/']);
    }
}
