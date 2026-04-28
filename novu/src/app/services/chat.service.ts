import { Injectable, inject } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject } from 'rxjs';
import { UserAPIService } from './user-api.service';

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
  public connectionStatus$ = new Subject<boolean>();

  connect(userId: number, otherUserId: number): void {
    const token = this.userAPI.getToken();
    
    if (!token) {
      console.error('❌ No hay token de autenticación. Debes hacer login primero.');
      this.connectionStatus$.next(false);
      return;
    }
    
    const wsUrl = `ws://localhost:8000/ws/chat/${userId}/${otherUserId}/?token=${token}`;
    console.log('🔌 Conectando a WebSocket con token:', token.substring(0, 30) + '...');
    
    this.socket$ = webSocket({
      url: wsUrl,
      openObserver: {
        next: () => {
          console.log('✅ WebSocket conectado exitosamente');
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
    
    if (!message.trim()) {
      return;
    }
    
    this.socket$.next({ message: message });
    console.log('📤 Mensaje enviado:', message);
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      console.log('🔌 WebSocket cerrado manualmente');
    }
  }
}