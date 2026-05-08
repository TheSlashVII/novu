import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {UserAPIService} from '../../services/user-api.service';
import {Router} from '@angular/router';
import {UserCardService} from '../../services/user-card.service';
import {CardTab, CardTabService} from '../../services/card-tab.service';
@Component({
  selector: 'app-admin-create-users',
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './admin-create-users.component.html',
  styleUrl: './admin-create-users.component.css'
})
export class AdminCreateUsersComponent {
    passwordShowText:string = "Show" // change the toggle button
    isPasswordHidden:boolean = true // to toggle between showing the password or not
    showRestrictedSection:boolean = false // this is to show the section in case you want to create a restricted user at first
    userForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.maxLength(200)]),
        surnames: new FormControl('', [Validators.required, Validators.maxLength(200)]),
        email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(200)]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        school_name: new FormControl('', [Validators.maxLength(150)]),
        gender: new FormControl(''),
        biography: new FormControl('', [Validators.maxLength(150)]),
        height: new FormControl('', [Validators.pattern(/^[0-9]{1,3}$/)]),
        date_of_birth: new FormControl('', [Validators.required]),
        min_age: new FormControl(0, [Validators.min(0)]),
        max_age: new FormControl(null, [Validators.min(0)]),
        profile_pic: new FormControl(''),
        max_distance_km: new FormControl(null, [Validators.min(1)]),
        // show_me: new FormControl(true),
        is_new: new FormControl(true),
        restricted: new FormControl(false),
        restricted_reason: new FormControl('', [Validators.maxLength(100)]),
        restricted_at: new FormControl(null),
        admin: new FormControl(false),
    })
    constructor(private userAPIService: UserAPIService, private router:Router, private userCardService:UserCardService, private cardTabService:CardTabService) {

    }
    togglePassword(){
        this.isPasswordHidden = !this.isPasswordHidden; // turn on or off the option to show the password in plain text
        switch (this.isPasswordHidden) {
            case true:
                this.passwordShowText = "Show"
                break;
            case false:
                this.passwordShowText = "Hide"
                break;
            default:
                this.passwordShowText = "Hide"
                break;
        }
        
    }

    Submit(){
        const f = this.userForm.value;
        const formData = new FormData();

        formData.append('name', f.name!);
        formData.append('surnames', f.surnames!);
        formData.append('email', f.email!);
        formData.append('password', f.password!);

        formData.append('school_name', f.school_name || '');
        formData.append('gender', f.gender || '');
        formData.append('biography', f.biography || '');
        formData.append('height', f.height || '');

        formData.append(
            'date_of_birth',
            new Date(f.date_of_birth!).toISOString().split('T')[0]
        );

        formData.append('min_age', String(f.min_age));
        if (f.max_age != null) formData.append('max_age', String(f.max_age));

        if (f.max_distance_km != null) {
            formData.append('max_distance_km', String(f.max_distance_km));
        }

        // formData.append('show_me', String(f.show_me));
        formData.append('is_new', String(f.is_new));
        formData.append('restricted', String(f.restricted));
        formData.append('admin', String(f.admin));

        if (f.restricted_reason) {
            formData.append('restricted_reason', f.restricted_reason);
        }

        if (f.restricted_at) {
            formData.append(
                'restricted_at',
                new Date(f.restricted_at).toISOString().split('T')[0]
            );
        }
        this.userAPIService.adminCreateUser(formData).subscribe({
            next: (res) => {
                const newUser:any = res
                this.userCardService.createUserCard(newUser.id).subscribe((userCard) => {
                    console.log(res)
                    let tab: CardTab = {
                        id_section: 1,
                        id_card: userCard.user,
                        body: 'This is the default card tab. Edit it to add more information about you!',
                        header: 'Default Card Tab',
                        sub_header: ' Default header',
                        tab_biography:
                            'This is the default biography. Edit it to add more information about you!',
                        background_photo: 'Not uploaded yet'
                    };
                    this.cardTabService.createCardTab(newUser.id, tab).subscribe(res => {console.log(res)})

                })

            },
            error: err => {
                console.log(err.error.message);
            }
        })

    }
    toAdminPanel(){
        this.router.navigateByUrl('/admin');
    }
    /**
     * Function used to close out sessions
     */
    logout(){
        this.userAPIService.logoutJWT();
        this.router.navigateByUrl("");
    }

}
