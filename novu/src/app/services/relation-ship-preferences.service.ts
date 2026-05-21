import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {baseServerURL} from '../baseURLconfig';

@Injectable({
  providedIn: 'root'
})
export class RelationShipPreferencesService {
  // PORT: number = 8000;
  //baseServerURL: string = `http://localhost:${this.PORT}/api/users`;

  constructor(private http:HttpClient) { }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private authHeaders(): {headers: HttpHeaders}{
    return {
      headers: new HttpHeaders({Authorization: 'Bearer ' + this.getToken()})
    };
  }

  //POST /API/USERS/RELATION-PREFERENCES/SAVE/
  saveRelationshipPreferences(userId: number, preference: string): Observable<any>{
    return this.http.post(
      `${baseServerURL}/relationship-preference/save/`,
      {user_id: userId, preference},
      this.authHeaders()
    )
  }

  //GET /api/users/relationship-preference/?user_id=1
  getRelationshipPreference(userId: number): Observable<{preference: string}>{
    return this.http.get<{ preference: string}>(
      `${baseServerURL}/relationship-preference/?user_id=${userId}`,
      this.authHeaders()
    )
  }
}
