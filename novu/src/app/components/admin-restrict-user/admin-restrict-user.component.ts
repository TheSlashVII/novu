import { Component } from '@angular/core';
import {UserAPIService} from '../../services/user-api.service';
import {ReactiveFormsModule, FormGroup, Validators, FormControl, FormBuilder, FormArray} from '@angular/forms';
import {Router} from '@angular/router';

/**
 * {
 *     "id": 1,
 *     "name": "dje",
 *     "surnames": "asdw",
 *     "email": "jr@gmail.com",
 *     "password": "pbkdf2_sha256$1200000$upYtyVV2napY9cMTuMO8BR$1jIFx7pqeRZPX6i7RGqpW64WtXRjIbcnoHj8rplIfzs=",
 *     "school_name": "",
 *     "gender": "",
 *     "biography": "",
 *     "height": "",
 *     "date_of_birth": "2002-02-22",
 *     "min_age": 0,
 *     "max_age": null,
 *     "profile_pic": null,
 *     "max_distance_km": null,
 *     "show_me": true,
 *     "likes": 0,
 *     "is_new": false,
 *     "restricted": false,
 *     "restricted_reason": "",
 *     "restricted_at": null,
 *     "admin": true,
 *     "is_active": true,
 *     "last_login": null
 * }
 */
@Component({
  selector: 'app-admin-restrict-user',
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './admin-restrict-user.component.html',
  styleUrl: './admin-restrict-user.component.css'
})
export class AdminRestrictUserComponent {
    searchBar = new FormGroup({
        name: new FormControl(''),
    })
    results:{id:number,name:string, surnames:string, restricted_reason:string, restricted:boolean, restricted_at:string}[] = []


    constructor(private userAPI: UserAPIService, private router: Router) {
        this.userAPI.listAllUsers().subscribe((res:any) => {
            this.results = res;
        })
    }

    submit() {
        let searchedName:string = this.searchBar.value.name!
        if(searchedName.length > 0){
            this.getUsersByName(this.searchBar.value.name)
        } else {
            this.userAPI.listAllUsers().subscribe((res:any) => {this.results = res;})
        }

    }
    getUsersByName(name:any){
        return this.userAPI.getUserByName(name).subscribe(res => {
            let userList:any = res
            this.results = userList
            console.log(res)
        });
    }
    splitDate(date:string){
        let formatedDate: Date;
        formatedDate = new Date(date);
        return formatedDate.toLocaleDateString("es-ES");

    }
    goToDetail(id:number){
        this.router.navigateByUrl(`/admin/restrict_user/detail/${id}`)
    }
    logout(){
        this.userAPI.logoutJWT();
        this.router.navigateByUrl("");
    }

}
