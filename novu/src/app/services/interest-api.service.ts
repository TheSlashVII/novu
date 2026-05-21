import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {baseServerURL} from '../baseURLconfig';
@Injectable({
    providedIn: 'root'
})

export class InterestApiService {
    PORT: number = 8000 // django's port

    // baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
    baseServerURL:string = baseServerURL;
    constructor(private http: HttpClient) {}
    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
    private authHeaders(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({ "Authorization": "Bearer " + this.getToken() })
        };
    }
    //Gets all the interests availables
    getInterests(): Observable<{ id: number; name: string }[]> {
        return this.http.get<{ id: number; name: string }[]>(`${this.baseServerURL}/interests/`);
    }

    //Save the interests selected by the user
    saveUserInterests(userId: number, interestIds: string[]): Observable<any> {
        return this.http.post(`${this.baseServerURL}/interests/save/`, {
            user_id: userId,
            interests: interestIds
        }, this.authHeaders());
    }
}
