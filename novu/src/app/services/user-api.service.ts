import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable, tap } from 'rxjs';
import {UserProfile} from '../components/home/home.component';

@Injectable({
  providedIn: 'root'
})
export class UserAPIService {
    PORT: number = 8000 // django's port

    //baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
    baseServerURL:string = `/api/users`;
    constructor(private http:HttpClient) { }

    /**
     * Function used to facilitate the authentication process when making requests.
     * It will make the authentication headers with the current token
     * @private
     */
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

    /**
     * Api endpoint to get the amount of users accounts in the website
     */
    adminGetActiveUserCount():Observable<{count:number}>{
        const ROUTE:string = `${this.baseServerURL}/admin/count/`;
        return this.http.get<{count:number}>(ROUTE, this.authHeaders());
    }

    /**
     * Endpoint to update users via admin panel
     * @param data New user data
     * @param id User's id
     */
    adminUpdateUser(data:any, id:number){
        const ROUTE:string = `${this.baseServerURL}/admin/update/${id}/`;
        return this.http.patch(ROUTE, data, this.authHeaders())
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

    /**
     * Function used to update a user's age
     * @param id user's id
     * @param age users updated age value
     */
    updateUserAge(id:number, age:number){
        const ROUTE:string = `${this.baseServerURL}/age/update/${id}`;
        return this.http.patch(ROUTE,{age:age} ,this.authHeaders())
    }

    /**
     * Function used to update a user's gender
     * @param id
     * @param gender
     */
    updateUserGender(id:number, gender:string){
        const ROUTE:string = `${this.baseServerURL}/gender/update/${id}`;
        return this.http.patch(ROUTE, {gender:gender} ,this.authHeaders())
    }

    getUserProfiles(){
        const ROUTE:string = `${this.baseServerURL}/profiles/`;
        // return this.http.get(ROUTE, this.authHeaders())
        return this.http.get<UserProfile[]>(ROUTE)
    }
    uploadPhoto(id:number, data:any){
        const ROUTE:string = `${this.baseServerURL}/photos/upload/${id}`;
    //        return this.http.post(ROUTE, this.authHeaders())
        return this.http.post(ROUTE, data)
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
            const base64 = token.split('.')[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch (e) {
            console.error('Error codificando token:', e);
            return null;
        }
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    isTokenExpired(token: string): boolean {
        try {
            const base64 = token.split('.')[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            return payload.exp < Date.now() / 1000;
            } catch (e) {
                return true;
            }
    }

    /**
        * Registrar un swipe (like/skip) en la base de datos
        * @param originUserId - ID del usuario que hace el swipe
        * @param targetUserId - ID del usuario que recibe el swipe
        * @param matched - true si es LIKE, false si es SKIP/NOPE
    */

    registerSwipe(originUserId: number, targetUserId: number, matched: boolean){
        const ROUTE = `${this.baseServerURL}/swipes/register/`;
        const data = {
            origin_user_id: originUserId,
            target_user_id: targetUserId,
            matched: matched
        };
        return this.http.post(ROUTE, data, this.authHeaders());
    }

    /**
        * Verificar si dos usuarios ya han hecho match
        * @param userId - ID del usuario actual
        * @param targetUserId - ID del otro usuario
    */

    checkMatch(userId: number, targetUserId: number){
        const ROUTE = `http://localhost:${this.PORT}/matches/check/`;
        return this.http.get(`${ROUTE}?user1=${userId}&user2=${targetUserId}`);
    }
}
