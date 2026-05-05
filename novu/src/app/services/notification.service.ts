import { Injectable, inject } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject } from 'rxjs';
import { UserAPIService } from './user-api.service';

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

    public notifications$ = new Subject<Notification>();
    public unreadCounts: { [userId: number]: number} = {};

    connect(): void {
        const token = this.userAPI.getToken();
        const userId = this.userAPI.getUserId();

        if (!token || !userId) return;

        const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/?token=${token}`;

        this.socket$ = webSocket({
            url: wsUrl,
            openObserver: {
                next: () => console.log('🔔 Notificaciones conectadas')
            },
            closeObserver: {
                next: () => console.log('🔔 Notificaciones desconectadas')
            }
        });

        this.socket$.subscribe({
            next: (data) => {
              if (data.type === 'notification') {
                this.notifications$.next(data);
                const senderId = data.sender_id;
                this.unreadCounts[senderId] = (this.unreadCounts[senderId] || 0) + 1;
              }
            },
            error: (err) => console.error('Error en notificaciones:', err)
        });
    }

    clearUnread(userId: number): void {
        this.unreadCounts[userId] = 0;
    }
}