import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {baseServerURL} from '../baseURLconfig';
@Injectable({
  providedIn: 'root'
})
export class EmailServiceService {
    // PORT: number = 8000 // django's port
    // baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
    baseServerURL:string = baseServerURL;
  constructor(private http:HttpClient) { }
    private authHeaders(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({ "Authorization": "Bearer " + this.getToken() })
        };
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    sendDenialEmail(email: string, name:string){
      const ROUTE: string = `${this.baseServerURL}/send_denial_mail/`;
      return this.http.post(ROUTE, {email:email, name:name}, this.authHeaders());
    }
    sendAcceptanceEmail(email: string, name:string){
        const ROUTE: string = `${this.baseServerURL}/send_acceptance_mail/`;
        return this.http.post(ROUTE, {email:email, name:name}, this.authHeaders());
    }

}
