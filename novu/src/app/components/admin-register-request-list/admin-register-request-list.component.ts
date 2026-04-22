import { Component } from '@angular/core';
import {registerRequestInterface} from "../admin-register-request-detail/admin-register-request-detail.component"
import {Router} from '@angular/router';
import {UserAPIService} from '../../services/user-api.service';


@Component({
  selector: 'app-admin-register-request-list',
  imports: [],
  templateUrl: './admin-register-request-list.component.html',
  styleUrl: './admin-register-request-list.component.css',
    standalone: true,
})
export class AdminRegisterRequestListComponent {
    requests: registerRequestInterface[];

    constructor(private route:Router, private userAPI:UserAPIService) {
        this.requests = [this.requestInitializer()] // done to initialize the list
        userAPI.listRegisterRequests().subscribe(response => {
            this.requestlistSetter(response);
        })

    }

    /**
     * Function used to transform the dates to readable formats
     * @param date the date inserted by each iteration or requests
     */
    splitDate(date:string){
        let formatedDate: Date;
        formatedDate = new Date(date);
        return formatedDate.toLocaleDateString("es-ES");

    }
    requestInitializer(){
        return {
            id_request:-1,
            name:"",
            surnames:"",
            email:"",
            password:"",
            date_of_birth:"",
            photo_student_id:"",
            photo_id_selfie:"",
            id_student:null,
            status:"",
            submitted_at:"",
        }
    }
    requestlistSetter(data:any){
        this.requests = data
        // console.log(this.requests);
    }
    goToAdminPanel(){
        this.route.navigateByUrl("admin")
    }
    checkRegisterRequestDetail(id:number){
        this.route.navigateByUrl(`admin/detail/request/${id}`)
    }
    /**
     * Function used to close out sessions
     */
    logout(){
        this.userAPI.logoutJWT();
        this.route.navigateByUrl("");
    }
}
