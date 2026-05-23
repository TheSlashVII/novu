import { Injectable, inject } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject, BehaviorSubject } from 'rxjs';
import { UserAPIService } from './user-api.service';
import {development} from '../baseURLconfig';

export interface ChatMessage {
  type?: string;
  message: string;
  sender_id?: number;
  sender_name?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private userAPI = inject(UserAPIService);
  private socket$!: WebSocketSubject<any>;

  public messages$ = new Subject<ChatMessage>();
  public connectionStatus$ = new BehaviorSubject<boolean>(false); // ← BehaviorSubject

  connect(userId: number, otherUserId: number): void {
    const token = this.userAPI.getToken();

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      this.connectionStatus$.next(false);
      return;
    }

    // const wsUrl = `ws://localhost:8000/ws/chat/${userId}/${otherUserId}/?token=${token}`;
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = development ? `ws://localhost:8000/ws/chat/${userId}/${otherUserId}/?token=${token}` : `${protocol}://${window.location.host}/ws/chat/${userId}/${otherUserId}/?token=${token}`;

    this.socket$ = webSocket({
      url: wsUrl,
      openObserver: {
        next: () => {
          console.log('✅ WebSocket conectado');
          this.connectionStatus$.next(true);
        }
      },
      closeObserver: {
        next: () => {
          console.log('❌ WebSocket desconectado');
          this.connectionStatus$.next(false);
        }
      }
    });

    this.socket$.subscribe({
      next: (message) => {
        console.log('📨 Mensaje recibido:', message);
        this.messages$.next(message);
      },
      error: (error) => {
        console.error('❌ Error en WebSocket:', error);
        this.connectionStatus$.next(false);
      }
    });
  }

  sendMessage(message: string): void {
    if (!this.socket$) {
      console.error('❌ No hay conexión WebSocket activa');
      return;
    }
    if (!message.trim()) return;
    this.socket$.next({ message: message });
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
