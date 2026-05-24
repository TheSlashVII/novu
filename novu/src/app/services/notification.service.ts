import { Injectable, inject } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ReplaySubject, Subject } from 'rxjs';
import { UserAPIService } from './user-api.service';
import {development} from '../baseURLconfig';

export interface Notification {
    type: string;
    sender_id: number;
    sender_name: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private userAPI = inject(UserAPIService);
    private socket$!: WebSocketSubject<any>;
    private connected: boolean = false;

    public notifications$ = new ReplaySubject<Notification>(10);
    public unreadCounts: { [userId: number]: number} = {};

    constructor() {
        const saved = localStorage.getItem('unreadCounts');
        if (saved) {
            this.unreadCounts = JSON.parse(saved);
        }
    }

    connect(): void {
        console.log('connect() llamado, connected:', this.connected);
        if (this.connected) {
            console.log('Ya conectado, saliendo');
            return;
        }
        //If is connected, don't reconnect
        if(this.socket$ && !this.socket$.closed) {
            console.log('Notificaciones ya conectadas.')
            return;
        }

        const token = this.userAPI.getToken();
        const userId = this.userAPI.getUserId();

        if (!token || !userId) return;

        // const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/?token=${token}`;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = development ?  `ws://localhost:8000/ws/notifications/${userId}/?token=${token}` : `${protocol}://${window.location.host}/ws/notifications/${userId}/?token=${token}`;
        this.socket$ = webSocket({
            url: wsUrl,
            openObserver: {
                next: () => {
                console.log('Notificaciones conectadas')
                this.connected = true;
                }
            },
            closeObserver: {
                next: () => {
                console.log('Notificaciones desconectadas')
                this.connected = false;
                }
            }
        });

        this.socket$.subscribe({
            next: (data) => {
              if (data.type === 'notification') {
                this.notifications$.next(data);
                const senderId = data.sender_id;
                this.unreadCounts[senderId] = (this.unreadCounts[senderId] || 0) + 1;
                localStorage.setItem('unreadCounts', JSON.stringify(this.unreadCounts));
              }
            },
            error: (err) => {
                console.error('Error en notificaciones:', err);
                this.connected = false;
            }
        });
    }

    clearUnread(userId: number): void {
        this.unreadCounts[userId] = 0;
        localStorage.setItem('unreadCounts', JSON.stringify(this.unreadCounts));
    }

    disconnect(): void {
        if(this.socket$) {
            this.socket$.complete();
            this.connected = false;
        }
    }
}
