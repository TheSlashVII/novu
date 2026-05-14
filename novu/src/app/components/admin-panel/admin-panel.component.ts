import { Component } from '@angular/core';
import {UserAPIService} from '../../services/user-api.service';
import {Router} from '@angular/router';

type requestCount = {
    request_count:number
}
@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
    standalone: true
})
export class AdminPanelComponent {
    /*
    * Amount of Pending register requests
    * */
    registerRequestsCount:number = 0;
    activeUserCount:number = 0;
    constructor(private userAPI:UserAPIService, private router:Router) {
        this.userAPI.getRegisterRequestCount().subscribe(res => {
            console.log(res);
            this.setRegisterRequestCount(res)
        })
        this.getActiveUserCount()
    }

    goToRegisterRequestList(){this.router.navigateByUrl("/admin/request")}
    setRegisterRequestCount(data:any){
        this.registerRequestsCount = data.request_count;
    }
    goToCreateUser(){
        this.router.navigateByUrl("/admin/create_user");
    }
    /**
     * Function used to close out sessions
     */
    logout(){
        this.userAPI.logoutJWT();
        this.router.navigateByUrl("");
    }
    goToRestrictUsers(){
        //this.router.navigateByUrl("/admin/restrict_users");
        this.router.navigateByUrl("/admin/restrict_user");
    }
    goToDeleteUsers(){
        this.router.navigateByUrl("/admin/delete_user");
    }
    getActiveUserCount(){
        this.userAPI.adminGetActiveUserCount().subscribe(res => {
            this.activeUserCount = res.count;
        })
    }
    goToUpdateUser(){
        this.router.navigateByUrl("/admin/update_user");
    }




}
