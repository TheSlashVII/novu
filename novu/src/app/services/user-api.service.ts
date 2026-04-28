import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserAPIService {
  private PORT: number = 8000 // django's port
  private baseServerURL:string = `http://localhost:${this.PORT}/api/users`;

  constructor(private http:HttpClient) { }

  createRegisterRequest(data:any){
    //headers = headers.append('enctype', 'multipart/form-data');
    const ROUTE:string = `${this.baseServerURL}/create/request`;
    return this.http.post(ROUTE, data)
  }
  deleteRegisterRequest(id:number){
      const ROUTE:string = `${this.baseServerURL}/delete/request/${id}/`;
      return this.http.delete(ROUTE)
  }
  login(data:any): Observable<any> {
    const ROUTE:string = `${this.baseServerURL}/login/`;
    return this.http.post(ROUTE, data).pipe(
        tap((response: any) => {
            if (response.access) {
                this.saveToken(response.access);
                //Guardar el user_id si viene en la respuesta
                if (response.user_id) {
                    localStorage.setItem('user_id', response.user_id.toString());
                } else {
                    const decoded = this.decodeToken();
                    if (decoded && decoded.user_id) {
                        localStorage.setItem('user_id', decoded.user_id.toString());
                    }
                }
            }
        })
    );
  }
  getRegisterRequestCount(){
      const ROUTE:string = `${this.baseServerURL}/count/request/`;
      return this.http.get(ROUTE)

  }

    /**
     * Function to create users
     * @param name user's name
     * @param surnames user's surname
     * @param email user's email
     * @param password user's password
     * @param date_of_birth user's date of birth
     */
  createUser(name:string, surnames:string, email:string, password:string, date_of_birth:string){
      const ROUTE:string = `${this.baseServerURL}/create/`;
      return this.http.post(ROUTE, {name:name, surnames:surnames, email:email, password:password, date_of_birth:date_of_birth})
  }
  adminCreateUser(data:any){
      const ROUTE:string = `${this.baseServerURL}/admin/create/`;
      return this.http.post(ROUTE, data)
  }

  getUserById(id:number | string){
      const ROUTE:string = `${this.baseServerURL}/retrieve/${id}/`;
      return this.http.get(ROUTE)
  }
  /*
  * function used to list register requests
   */
  listRegisterRequests(){
      const ROUTE:string = `${this.baseServerURL}/list/request`;
      return this.http.get(ROUTE)
  }
    /**
     * Function used to get the details of a register request
     * @param id
     */
  retrieveRegisterRequestDetails(id:any){
    const ROUTE:string = `${this.baseServerURL}/detail/request/${id}`;
    return this.http.get(ROUTE)
  }
  // JWT
    saveToken(token: string) {
        localStorage.setItem('access_token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getUserId(): number | null {
        const userId = localStorage.getItem('user_id');
        if(userId) {
            return parseInt(userId);
        }
        const decoded = this.decodeToken();
        if(decoded && decoded.user_id) {
            const id = parseInt(decoded.user_id);
            localStorage.setItem('user_id', id.toString());
            return id;
        }
        return null;
    }

    logoutJWT() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
    }
    decodeToken(): any {
        const token = this.getToken();
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error('Error decodificando toekn:', e);
            return null;
        }
        // JWT payload is the middle part, Base64 decoded
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
