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
  templateUrl: './admin-delete-user.component.html',
  styleUrl: './admin-delete-user.component.css'
})
export class AdminDeleteUserComponent {
    results:{id:number,name:string, surnames:string, restricted_reason:string, restricted:boolean, restricted_at:string}[] = []
    searchBar = new FormGroup({
        name: new FormControl(''),
    })

    constructor(private userAPI:UserAPIService, private router: Router) {
        this.userAPI.isAdmin().subscribe(status => {
            this.userAPI.listAllUsers(status.is_admin).subscribe((res:any) => {
                this.results = res;
                this.results = this.results.filter(users => users.id != Number(this.userAPI.decodeToken().user_id));
            })
        })

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
    delete(id:number){
        this.userAPI.adminDeleteUser(id).subscribe({
            next: (res)=> {
                console.log(res)
                this.userAPI.listAllUsers().subscribe((res:any) => {
                    this.results = res;
                })
                //this.router.navigateByUrl("/admin/delete_user")
            },
            error: err => {
                console.log(err)
            }
        })
    }
    goToPanel(){
        this.router.navigateByUrl('/admin');
    }
}
