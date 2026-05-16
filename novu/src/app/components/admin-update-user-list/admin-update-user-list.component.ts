import { Component } from '@angular/core';
import {UserAPIService} from '../../services/user-api.service';
import {Router} from '@angular/router';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
@Component({
  selector: 'app-admin-delete-user',
    imports: [
        FormsModule,
        ReactiveFormsModule,
    ],
  templateUrl: './admin-update-user-list.component.html',
  styleUrl: './admin-update-user-list.component.css'
})
export class AdminUpdateUserListComponent {
    results:{id:number,name:string, surnames:string, restricted_reason:string, restricted:boolean, restricted_at:string}[] = []
    searchBar = new FormGroup({
        name: new FormControl(''),
    })

    constructor(private userAPI:UserAPIService, private router: Router) {
        this.userAPI.isAdmin().subscribe(status => {
            this.userAPI.listAllUsers(status.is_admin).subscribe((res:any) => {
                this.results = res;
            })

        });

    }

    logout(){
        this.userAPI.logoutJWT();
        this.router.navigateByUrl("");
    }
    getUsersByName(name:any){
        return this.userAPI.getUserByName(name).subscribe(res => {
            let userList:any = res
            this.results = userList
            console.log(res)
        });
    }
    submit() {
        let searchedName:string = this.searchBar.value.name!
        if(searchedName.length > 0){
            this.getUsersByName(this.searchBar.value.name)
        } else {
            this.userAPI.listAllUsers().subscribe((res:any) => {this.results = res;})
        }

    }

    goToUpdateUserDetail(id: number){
        this.router.navigateByUrl(`/admin/update/${id}`)

    }
    goToPanel(){
        this.router.navigateByUrl('/admin');
    }
}
