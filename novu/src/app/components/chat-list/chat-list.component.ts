import { afterNextRender, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';

interface ChatPreview {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
  unreadCount: number;
}

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})

export class ChatListComponent {
  private router = inject(Router);
  private http= inject(HttpClient);
  private userAPI = inject(UserAPIService);

  chats: ChatPreview[] = [];
  loading: boolean = true;
  error: string = '';

  constructor() {
  afterNextRender(() => {
    const userId = this.userAPI.getUserId();
    console.log('userId:', userId);
    
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    console.log('Llamando a:', `http://localhost:8000/api/chat/conversations/${userId}/`);

    this.http.get<ChatPreview[]>(`http://localhost:8000/api/chat/conversations/${userId}/`)
      .subscribe({
        next: (data) => {
          console.log('Datos recibidos:', data);
          this.chats = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'No se pudieron cargar las conversaciones.';
          this.loading = false;
        }
      });
  });
}

  openChat(userId: number): void {
    this.router.navigate(['/chat', userId]);
  }
}
