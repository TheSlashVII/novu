import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class InterestApiService {
    PORT: number = 8000 // django's port

    baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
    constructor(private http: HttpClient) {}

    //Gets all the interests availables
    getInterests(): Observable<{ id: number; name: string }[]> {
        return this.http.get<{ id: number; name: string }[]>(`${this.baseServerURL}/interests/`);
    }

    //Save the interests selected by the user
    saveUserInterests(userId: number, interestIds: string[]): Observable<any> {
        return this.http.post(`${this.baseServerURL}/interests/save/`, {
            user_id: userId,
            interests: interestIds
        });
    }
}