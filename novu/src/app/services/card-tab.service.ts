import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

export interface CardTab {
    id_section?: number;
    id_card: number;
    body?: string; // deprecated field
    header: string;
    sub_header: string;
    tab_biography: string;
    background_photo: string | File;
}

@Injectable({
    providedIn: 'root',
})
export class CardTabService {
    PORT: number = 8000; // django's port

    // baseServerURL: string = `http://localhost:${this.PORT}/api/users`;
    baseServerURL: string = `/api/users`;
    constructor(private http: HttpClient) {}

    //GET /api/users/tabs/?user_id=1
    getTabsByUser(userId: number): Observable<CardTab[]> {
        return this.http.get<CardTab[]>(`${this.baseServerURL}/tabs/`, {
            params: { user_id: userId },
        });
    }

    //POST /api/users/tabs/create/
    createCardTab(userId: number, tab: CardTab): Observable<CardTab> {
        return this.http.post<CardTab>(`${this.baseServerURL}/tabs/create/`, {
            user_id: userId,
            ...tab,
        });
    }

    //GET /api/users/tabs/retrieve/<id>/
    getCardTab(userId: number): Observable<CardTab> {
        return this.http.get<CardTab>(
            `${this.baseServerURL}/tabs/retrieve/${userId}/`
        );
    }

    //PUT /api/users/tabs/update/<id>/
    updateCardTab(
        userId: number,
        idSection: number,
        tab: CardTab
    ): Observable<CardTab> {
        return this.http.put<CardTab>(
            `${this.baseServerURL}/tabs/update/${userId}/${idSection}`,
            tab
        );
    }

    //PATCH /api/users/tabs/patch/<id>/
    patchCardTab(
        userId: number,
        idSection: number,
        tab:any
    ): Observable<CardTab> {
        return this.http.patch<CardTab>(
            `${this.baseServerURL}/tabs/patch/${userId}/${idSection}/`,
            tab
        );
    }

    //DELETE /api/users/tabs/delete/<id>/
    deleteCardTab(userId: number, idSection: number): Observable<void> {
        return this.http.delete<void>(
            `${this.baseServerURL}/tabs/delete/${userId}/${idSection}/`
        );
    }
}
