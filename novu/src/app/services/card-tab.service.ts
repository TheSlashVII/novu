import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

export interface CardTab {
  id: number;
  card: number;
  body: string;
  header: string;
  sub_header?: string;
  tab_biography: string;
  background_photo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardTabService {
  PORT: number = 8000 // django's port

  baseServerURL: string = `http://localhost:${this.PORT}/api/users`;
  constructor(private http: HttpClient) { }

  //GET /api/users/tabs/?user_id=1
  getTabsByUser(userId: number): Observable<CardTab[]> {
    return this.http.get<CardTab[]>(`${this.baseServerURL}/tabs/`, {
      params: {user_id: userId}
    })
  }

  //POST /api/users/tabs/create/
  createCardTab(userId: number, tab: CardTab): Observable<CardTab>{
    return this.http.post<CardTab>(`${this.baseServerURL}/tabs/create/`, {
      user_id: userId,
      ...tab
    });
  }

  //GET /api/users/tabs/retrieve/<id>/
  getCardTab(tabId:number): Observable<CardTab>{
    return this.http.get<CardTab>(`${this.baseServerURL}/tabs/retrieve/${tabId}/`);
  }

  //PUT /api/users/tabs/update/<id>/
  updateCardTab(tabId: number, tab: CardTab): Observable<CardTab>{
    return this.http.put<CardTab>(`${this.baseServerURL}/tabs/update/${tabId}`, tab);
  }

  //PATCH /api/users/tabs/patch/<id>/
  patchCardTab(tabId: number, tab: Partial<CardTab>): Observable<CardTab>{
    return this.http.patch<CardTab>(`${this.baseServerURL}/tabs/patch/${tabId}/`, tab);
  }

  //DELETE /api/users/tabs/delete/<id>/
  deleteCardTab(tabId: number): Observable<void>{
    return this.http.delete<void>(`${this.baseServerURL}/tabs/delete/${tabId}/`);
  }
}
