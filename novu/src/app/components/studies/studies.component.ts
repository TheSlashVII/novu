import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudiesApiServiceService } from '../../services/studies-api-service.service';
import { UserAPIService } from '../../services/user-api.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-studies',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './studies.component.html',
  styleUrl: './studies.component.css'
})
export class StudiesComponent {

  constructor(private router: Router, private studiesApiService: StudiesApiServiceService, private userAPIService: UserAPIService) {}
  currentYear: number = new Date().getFullYear();

  studiesName: string = '';

  baseServerURL: any;

  //Save the current study of the user
  saveUserStudy(userId: number, studyName: string): void {
    this.studiesApiService.saveUserStudy(userId, studyName).subscribe();
  }

  goNext(): void {
    
    const token = this.userAPIService.decodeToken();
    this.saveUserStudy(token.user_id, this.studiesName);
    //this.router.navigate(['/interests']); 
  }
}
