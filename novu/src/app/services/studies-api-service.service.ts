import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudiesApiServiceService {

  PORT: number = 8000; // django's port

  baseServerURL: string = `http://localhost:${this.PORT}/api/users`;
  constructor(private http: HttpClient) {}
    private authHeaders(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({ "Authorization": "Bearer " + this.getToken() })
        };
    }
  //Save or update the current study for the user
  saveUserStudy(userId: number, studyName: string): Observable<any>{
    return this.http.post(`${this.baseServerURL}/studies/save/`,{
      user_id: userId,
      study_name: studyName
    }, this.authHeaders())
  }

  //Get the current study of a specific user
  getUserStudy(userId: number): Observable<{study_name: string}>{
    return this.http.get<{study_name: string}>(`${this.baseServerURL}/user_study/${userId}/`);
  }

  //Update user's study
  updateUserStudy(userId: number, studyName: string): Observable<any>{
    return this.http.put(`${this.baseServerURL}/update_user_study/`,{
      user_id: userId,
      study_name: studyName
    })
  }
    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
}
