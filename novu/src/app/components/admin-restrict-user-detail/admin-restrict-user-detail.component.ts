import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule, FormGroup, Validators, FormControl} from '@angular/forms';
import {UserAPIService} from '../../services/user-api.service';
import {ActivatedRoute, Router} from '@angular/router';
@Component({
  selector: 'app-admin-restrict-user-detail',
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './admin-restrict-user-detail.component.html',
  styleUrl: './admin-restrict-user-detail.component.css'
})
export class AdminRestrictUserDetailComponent implements OnInit {
    // {name:string, surnames:string, restricted:boolean, restricted_at:string, restricted_reason:string}
    userRestrictedStatusInfo:any = {}; // where we will store the user data retrieved
    userForm = new FormGroup({
        restricted: new FormControl(false),
        restricted_at: new FormControl(new Date().toISOString(), [Validators.required]), // default date: Current date in ISO format
        restricted_reason: new FormControl('', [Validators.required])

    })
    constructor(private userAPI:UserAPIService, private activatedRoute:ActivatedRoute, private router:Router) {
    }
    splitDate(date:string){
        let formatedDate: Date;
        formatedDate = new Date(date);
        return formatedDate.toLocaleDateString("es-ES");

    }
    submit(){
        const formData = new FormData();
        formData.append('id', this.userRestrictedStatusInfo.id); // add field for searching the user
        formData.append('restricted_reason', this.userForm.value.restricted_reason!);
        formData.append('restricted', String(this.userForm.value.restricted!)); // must reconvert later to boolean
        // console.log(new Date(this.userForm.value.restricted_at!).toISOString());
        const date = this.userForm.value.restricted_at!.split('T')[0];
        console.log(date);
        /*
        const [year, month, day] = date.split("-")
        const normalizedDate = `${year}-${month}-${day}`;

         */
        formData.append('restricted_at', this.normalizeDate(date));
        let dataToSend: Record<string, any> = {}
        formData.forEach((value,key) => {
            dataToSend[key] = value;
        })
        console.log(dataToSend);
        this.userAPI.adminModifyRestrictedStatus(dataToSend).subscribe({
            next: (res)=> {
                console.log(res);
            }, error: err => {
                console.log(err);
            }
        });
    }

    /**
     * Function used to normalize dates. Reformatting them into the format that Django awaits
     * @param ISOdate Date in ISO format
     */
    normalizeDate(ISOdate:string):string{
        const date = ISOdate.split('T')[0];
        const [year, month, day] = date.split("-")
        return `${year}-${month}-${day}`;
    }

    /**
     * Functionality that runs on page load
     */
    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(params => {
            const id:number = Number(params.get('id'));
            this.userAPI.getUserById(id).subscribe(response => {
                let user:any = response
                this.userRestrictedStatusInfo = user;
                console.log(this.userRestrictedStatusInfo)
            })

        })
    }
    goToList(){
        this.router.navigateByUrl("/admin/restrict_user")
    }
    logout(){
        this.userAPI.logoutJWT();
        this.router.navigateByUrl("");
    }
}
