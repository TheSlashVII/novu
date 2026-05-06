import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { CardTab } from './card-tab.service';

export interface UserCard {
  user: number;
  amount_tabs: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserCardService {
  PORT: number = 8000 // django's port

//   baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
    baseServerURL:string = `/api/users`;
    private authHeaders(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({ "Authorization": "Bearer " + this.getToken() })
        };
    }
    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
  constructor(private http: HttpClient) { }

  //GET /api/users/cards/?user_id=1
  getUserCard(userId: number): Observable<UserCard> {
    return this.http.get<UserCard>(`${this.baseServerURL}/cards/`, {
      params: {user_id: userId}, headers: { "Authorization": "Bearer " + this.getToken() }
    },);
  }

  //POST /api/users/cards/create/
  createUserCard(userId: number): Observable<UserCard>{
    return this.http.post<UserCard>(`${this.baseServerURL}/cards/create/`, {
      user_id: userId
    });
  }

  // GET /api/users/cards/retrieve/<id>/
  getUserCardById(userId: number): Observable<UserCard>{
    return this.http.get<UserCard>(`${this.baseServerURL}/cards/retrieve/${userId}/`);
  }

  //GET /api/users/cards/with-tabs/?user_id=1
  getCardWithTabs(userId: number): Observable<UserCard>{
    return this.http.get<UserCard>(`${this.baseServerURL}/cards/with-tabs/`, {
      params: {user_id: userId}
    })
  }
}
