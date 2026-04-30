import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http"
@Injectable({
  providedIn: 'root'
})
export class UserAPIService {
  PORT: number = 8000 // django's port

  baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
  constructor(private http:HttpClient) { }

    private authHeaders(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({ "Authorization": "Bearer " + this.getToken() })
        };
    }


  login(data:any):Observable<{access:string, refresh:string, is_new:boolean, is_restricted:boolean, error:string}>  {
    const ROUTE:string = `${this.baseServerURL}/login/`;
    return this.http.post<{access:string, refresh:string, is_new:boolean, is_restricted:boolean, error:string}> (ROUTE, data)
  }
// register request functions

    /**
     * Function used to create a register request
     * @param data
     */
    createRegisterRequest(data:any){
        //headers = headers.append('enctype', 'multipart/form-data');
        const ROUTE:string = `${this.baseServerURL}/create/request`;
        return this.http.post(ROUTE, data)
    }

    /**
     * function used to delete a register request
     * @param id
     */
    deleteRegisterRequest(id:number){
        const ROUTE:string = `${this.baseServerURL}/delete/request/${id}/`;
        return this.http.delete(ROUTE, this.authHeaders())
    }
    /**
     * Function used to list register requests
     */
  listRegisterRequests(){
        const ROUTE:string = `${this.baseServerURL}/list/request/`;
        console.log(localStorage.getItem("access_token"));
        // console.log(this.isTokenExpired(localStorage.getItem("access_token")!));
        return this.http.get(ROUTE, this.authHeaders())
    }
  getRegisterRequestCount(){
      const ROUTE:string = `${this.baseServerURL}/count/request/`;
      return this.http.get(ROUTE, this.authHeaders())

  }
    /**
     * Function used to get the details of a register request
     * @param id
     */
    retrieveRegisterRequestDetails(id:any){
        const ROUTE:string = `${this.baseServerURL}/detail/request/${id}`;
        return this.http.get(ROUTE, this.authHeaders())
    }
// user management functions

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

    /**
     * Admin user creation
     * @param data
     */
  adminCreateUser(data:any){
      const ROUTE:string = `${this.baseServerURL}/admin/create/`;
      return this.http.post(ROUTE, data)
  }
  adminDeleteUser(id:number){
      const ROUTE:string = `${this.baseServerURL}/admin/delete/${id}`;
      return this.http.delete(ROUTE, this.authHeaders())
  }

    /**
     * Function used to modify the restricted status of the user
     * @param data
     */
  adminModifyRestrictedStatus(data:any){
    const ROUTE:string = `${this.baseServerURL}/admin/user/modify/access/`;
    return this.http.put(ROUTE, data, this.authHeaders())
  }

  adminGetActiveUserCount():Observable<{count:number}>{
      const ROUTE:string = `${this.baseServerURL}/admin/count/`;
      return this.http.get<{count:number}>(ROUTE, this.authHeaders());
  }

    /**
     * Function used to get a user by its id
     * @param id
     */
  getUserById(id:number | string){
      const ROUTE:string = `${this.baseServerURL}/retrieve/${id}/`;
      return this.http.get(ROUTE, this.authHeaders())
  }

    /**
     * Function used to search users
     */
  getUserByName(name:any){
      const ROUTE:string = `${this.baseServerURL}/admin/user/search/`;
      return this.http.post(ROUTE, {name:name} , this.authHeaders());
  }


    /**
     * Function used to list all users available in the database
     */
  listAllUsers(){
      const ROUTE:string = `${this.baseServerURL}/list/`;
      return this.http.get(ROUTE)
  }
  updateIsUserNewStatus(id:number){
    const ROUTE:string = `${this.baseServerURL}/update/status/${id}`;
    return this.http.put(ROUTE,{is_new:0} ,this.authHeaders())
  }

  // JWT
    saveToken(token: string) {
      if(this.getToken() != null ){
          this.logoutJWT()
      }
        localStorage.setItem('access_token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    logoutJWT() {
        localStorage.removeItem('access_token');
    }
    decodeToken(): any {
        const token = this.getToken();
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1])); // atob decodes base64 content
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
    isTokenExpired(token: string): boolean {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Date.now() / 1000;
    }
}
