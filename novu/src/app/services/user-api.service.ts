import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable, tap } from 'rxjs';
import {UserProfile} from '../components/home/home.component';
import {baseServerURL} from '../baseURLconfig';
@Injectable({
  providedIn: 'root'
})
export class UserAPIService {
    // PORT: number = 8000 // django's port
    // baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
    baseServerURL:string = baseServerURL;
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

    getUserProfile(id:number){
        const ROUTE:string = `${this.baseServerURL}/profile/${id}/`;
        return this.http.get<UserProfile>(ROUTE, this.authHeaders())
    }
    // register request functions

    /**
     * Function used to create a register request
     * @param data
     */
    createRegisterRequest(data:any){
        //headers = headers.append('enctype', 'multipart/form-data');
        const ROUTE:string = `${this.baseServerURL}/create/request/`;
        return this.http.post(ROUTE, data)
    }

    /**
     * Function used to accept a register request
     * @param id
     */
    acceptRegisterRequest(id: number): Observable<any> {
        const ROUTE = `${this.baseServerURL}/accept/request/${id}/`;
        return this.http.post(ROUTE, {
            headers: this.authHeaders().headers,
            body: {
                user_id: this.getUserId()!
            }
        });
    }

    /**
     * function used to delete a register request
     * @param id
     */
    deleteRegisterRequest(id:number){
        const ROUTE:string = `${this.baseServerURL}/delete/request/${id}/`;
        return this.http.delete(ROUTE,{
            headers: this.authHeaders().headers,
            body: {user_id: this.getUserId()!}
        })
    }

    /**
     * Function used to list register requests
     */
    listRegisterRequests(){
        const ROUTE:string = `${this.baseServerURL}/list/request/`;
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
    updateUserProfile(data:any){
        const ROUTE:string = `${this.baseServerURL}/profile/update/`;
        return this.http.put(ROUTE, data, this.authHeaders())
    }

    // user management functions


    /**
     * Admin user creation
     * @param data
     */
    adminCreateUser(data:any){
        const ROUTE:string = `${this.baseServerURL}/admin/create/`;
        return this.http.post(ROUTE, data, this.authHeaders())
        // return this.http.post(ROUTE, data)
    }
    adminDeleteUser(id:number){
        const ROUTE:string = `${this.baseServerURL}/admin/delete/${id}`;
        return this.http.delete(ROUTE, {
            headers: this.authHeaders().headers,
            body: {
                user_id: this.getUserId()!
            }

        })
        //return this.http.delete(ROUTE, this.authHeaders())
    }

    /**
     * Function used to modify the restricted status of the user
     * @param data
     */
    adminModifyRestrictedStatus(data:any){
        const ROUTE:string = `${this.baseServerURL}/admin/user/modify/access/`;
        return this.http.put(ROUTE,data, this.authHeaders())
        // return this.http.put(ROUTE, data, this.authHeaders())
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
    listAllUsers(adminStatus:boolean = false) {
        const ROUTE: string = `${this.baseServerURL}/list/`;
        return this.http.post(ROUTE,{"is_admin":adminStatus} , this.authHeaders())
    }
    isAdmin(){
        const ROUTE:string = `${this.baseServerURL}/status/admin/`;
        return this.http.post<{is_admin:boolean}>(ROUTE, {"user_id": Number(this.decodeToken().user_id)},this.authHeaders())
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
        return this.http.post<{message:string, photo:{id_photo:number, url:string, visible:boolean, user_id:number}}>(ROUTE, data)
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
    */

    checkMatch(userId: number){
        const ROUTE = `${this.baseServerURL}/matches/user/${userId}`;
        return this.http.get<{id:number, active:boolean, user1_id:number, user2_id:number}[]>(ROUTE, this.authHeaders());
    }

   /**
   * Solicita el envío del email de recuperación de contraseña.
   * @param email Email del usuario
   */
   requestPasswordReset(email: string): Observable<any> {
     const ROUTE = `${this.baseServerURL}/password-reset/request/`;
     return this.http.post(ROUTE, {email})
   }

   /**
   * Valida si un token de reset sigue siendo válido (no expirado, no usado).
   * @param token Token UUID que llegó por email
   */
   validateResetToken(uid: string,token: string): Observable<any> {
    const ROUTE = `${this.baseServerURL}/password-reset/validate/`;
    return this.http.post(ROUTE, {uid,token})
   }

   /**
   * Confirma el reset de contraseña con el token y la nueva contraseña.
   * @param token Token UUID que llegó por email
   * @param newPassword Nueva contraseña elegida por el usuario
   */
   confirmPasswordReset(uid:string, token: string, newPassword: string): Observable<any> {
    const ROUTE = `${this.baseServerURL}/password-reset/confirm/`;
    return this.http.post(ROUTE, {uid,token, new_password: newPassword})
   }
}
