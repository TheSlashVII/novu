import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudiesApiServiceService } from '../../services/studies-api-service.service';
import { UserAPIService } from '../../services/user-api.service';
import { CommonModule } from '@angular/common';
import {UserProfile} from '../home/home.component';

@Component({
  selector: 'app-studies',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './studies.component.html',
  styleUrl: './studies.component.css'
})
export class StudiesComponent {

  constructor(private router: Router, private studiesApiService: StudiesApiServiceService, private userAPIService: UserAPIService) {
      this.userAPIService.getUserById(this.userAPIService.getUserId()!).subscribe({
          next: value =>{
              let user:UserProfile = (value as UserProfile); // cast the type into UserProfile
              if (!user.is_new){
                  this.router.navigate(["/home"])
              }
          },

      })
  }
  currentYear: number = new Date().getFullYear();

  studiesName: string = '';
    errorMessage:string = ''
    isErrorMessageDisplaying:boolean = false;
  baseServerURL: any;

  //Save the current study of the user
  saveUserStudy(userId: number, studyName: string): void {
    this.studiesApiService.saveUserStudy(userId, studyName).subscribe({
        next: success => {
            this.router.navigate(['/relationship-preferences']);
        }, error: err => {
            let errorMSG:{error:string} = (err as {error:string});
            this.errorMessage = errorMSG.error;
            this.isErrorMessageDisplaying = true
            setTimeout(()=>{
                this.isErrorMessageDisplaying = false
            }, 2000)
        }
    });
  }

  goNext(): void {
      const token = this.userAPIService.decodeToken();
      this.saveUserStudy(token.user_id, this.studiesName);
      this.router.navigate(['/relationship-preferences']);

  }
}
