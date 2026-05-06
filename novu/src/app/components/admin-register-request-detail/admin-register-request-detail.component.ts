import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAPIService } from '../../services/user-api.service';
import { UserCardService } from '../../services/user-card.service';
import { CardTabService } from '../../services/card-tab.service';
import { CardTab } from '../../services/card-tab.service';
export interface registerRequestInterface {
    id_request: number;
    name: string;
    surnames: string;
    email: string;
    password: string;
    date_of_birth: string;
    photo_student_id: string;
    photo_id_selfie: string;
    id_student: string | null;
    status: string;
    submitted_at: string;
}

@Component({
    selector: 'app-admin-register-request-detail',
    imports: [],
    templateUrl: './admin-register-request-detail.component.html',
    styleUrl: './admin-register-request-detail.component.css',
})
/*
* {
    "id_request": 3,
    "name": "Jr1",
    "surnames": "Kr2",
    "email": "jjsi@gmail.com",
    "password": "123456789",
    "date_of_birth": "2008-05-21",
    "photo_student_id": "http://localhost:8000/photos/register_request/cbcb53b0-745f-4a67-8c84-ffc3afa10395.png",
    "photo_id_selfie": "http://localhost:8000/photos/register_request/ad8e2a3a-0132-497d-97d5-94d34385b658.png",
    "id_student": null,
    "status": "Pending",
    "submitted_at": "2026-04-18T16:52:14.188056Z"
}
* */
export class AdminRegisterRequestDetailComponent {
    email: string = 'user@example.com';
    registerRequest: registerRequestInterface;
    constructor(
        private router: Router,
        activatedRoute: ActivatedRoute,
        private userAPI: UserAPIService,
        private userCard: UserCardService,
        private cardTab: CardTabService
    ) {
        // to get the id inserted by the route on the get request
        this.registerRequest = this.requestInitializer();

        activatedRoute.paramMap.subscribe((param) => {
            const id = param.get('id');
            userAPI.retrieveRegisterRequestDetails(id).subscribe((res) => {
                this.setRegisterRequest(res);
            });
        });
    }
    setRegisterRequest(registerRequest: any) {
        this.registerRequest = registerRequest;
        console.log(this.registerRequest);
    }
    /*
     * This function is to manage in the case where the OCR can't read the student ID
     * */
    getStudentId() {
        if (this.registerRequest.id_student == null) {
            return 'unavailable';
        }
        return this.registerRequest.id_student;
    }
    getStudentIdImage(){
        // const server = "http://localhost:8000/";
        const server = window.location.origin;
        const path = `${server}${this.registerRequest.photo_student_id}`;
        return path;
    }
    getStudentSelfieImage(){
        // const server = "http://localhost:8000/";
        const server = window.location.origin;
        const path = `${server}${this.registerRequest.photo_id_selfie}`;
        return path;
    }
    checkStudentIdImage(){
        const path = this.getStudentSelfieImage()
        window.open(path, "_blank");
    }
    checkStudentIdSelfieImage() {
        window.open(this.registerRequest.photo_id_selfie, '_blank');
    }

    /**
     * Deletes a register request after denial or approval
     * @param id user id
     * @param redirect should the function redirect to the postDenial page
     */
    deleteRequest(id:number, redirect:boolean = false){
        this.userAPI.deleteRegisterRequest(id).subscribe({
            next: ()=>{
                if(redirect){
                    this.goToDeniedRequest()
                }
            }, error: err => {
                console.log(err);
            }
        })

    }

    createUser() {
        let data = {
            name: this.registerRequest.name,
            surnames: this.registerRequest.surnames,
            email: this.registerRequest.email,
            password: this.registerRequest.password,
            date_of_birth: this.registerRequest.date_of_birth,
        };
        this.userAPI
            .createUser(
                data.name,
                data.surnames,
                data.email,
                data.password,
                data.date_of_birth
            )
            .subscribe((res: any) => {
                console.log(res);
                let userId = res.id;
                this.deleteRequest(this.registerRequest.id_request);
                this.userCard.createUserCard(res.id).subscribe((res) => {
                    console.log(res);
                    let tab: CardTab = {
                        id_section: 1,
                        id_card: res.user,
                        body: 'This is the default card tab. Edit it to add more information about you!',
                        header: 'Default Card Tab',
                        sub_header: 'A ',
                        tab_biography:
                            'This is the default biography. Edit it to add more information about you!',
                        background_photo: 'A '
                    };
                    this.cardTab.createCardTab(userId, tab).subscribe( {
                        next: value => {
                            console.log(value);
                            this.goToAcceptedRequest()
                        }, error:value => {
                            console.log(value);
                        }

                    });
                });
            });
    }

    requestInitializer() {
        return {
            id_request: -1,
            name: '',
            surnames: '',
            email: '',
            password: '',
            date_of_birth: '',
            photo_student_id: '',
            photo_id_selfie: '',
            id_student: null,
            status: '',
            submitted_at: '',
        };
    }
    goToRequestList() {
        this.router.navigateByUrl('/admin/request');
    }
    goToAcceptedRequest(){
        this.router.navigateByUrl('/admin/post_accept');
    }
    goToDeniedRequest(){

        this.router.navigateByUrl('/admin/post_deny');
    }

}

