import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http"
@Injectable({
  providedIn: 'root'
})
export class UserAPIService {
  PORT: number = 8000 // django's port

  baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
  constructor(private http:HttpClient) { }

  createRegisterRequest(data:any){
    //headers = headers.append('enctype', 'multipart/form-data');
    const ROUTE:string = `${this.baseServerURL}/create/request`;
    return this.http.post(ROUTE, data)
  }
  login(data:any){
    const ROUTE:string = `${this.baseServerURL}/login`;
    return this.http.post(ROUTE, data)
  }
  getStudentIdPhoto(photoUrl:any){
      const ROUTE:string = photoUrl;
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
}
