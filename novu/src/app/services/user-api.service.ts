import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
@Injectable({
  providedIn: 'root'
})
export class UserAPIService {
  PORT: number = 8000

  baseServerURL:string = `http://localhost:${this.PORT}/api/users`;
  constructor(private http:HttpClient) { }

  createRegisterRequest(data:any){
    //const ROUTE:string = `${this.baseServerURL}/create/request`;
    const ROUTE:string = `${this.baseServerURL}/test/`;
    return this.http.post(ROUTE, data)
  }
}
