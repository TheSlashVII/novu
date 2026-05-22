import { Component, inject, signal, viewChild, ElementRef, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';
import { NotificationService } from '../../services/notification.service';
import {development} from '../../baseURLconfig';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);
  private userAPI = inject(UserAPIService);
  private notificationService = inject(NotificationService);

  messages = signal<ChatMessage[]>([]);
  newMessage = '';
  currentUserId!: number;
  otherUserId!: number;
  menuOpen = false;
  blockSuccess = false;

  userName = signal('');
  userAvatar = signal('');
  isOnline = signal(false);
  isConnected = signal(false);

  private messagesContainer = viewChild<ElementRef>('messagesContainer');
  private shouldScroll = false;

  constructor() {
    this.otherUserId = Number(this.route.snapshot.paramMap.get('id'));

    // Obtener el ID del usuario logueado
    const userId = this.userAPI.getUserId();
      if (!userId) {
          this.router.navigate(['/login']);
          return;
      }
    this.userAPI.getUserProfilePicture(this.otherUserId).subscribe({next: user => {
        if (user.profile_picture != null) {
            let userProfile = development ? `http://localhost:8000/${user.profile_picture}` : `${window.location.origin}/${user.profile_picture}`;
            this.userAvatar.set(userProfile!)
        }
    }})

    this.currentUserId = userId;
    console.log('✅ Usuario actual ID:', this.currentUserId);

    //Clean notifications when you open the chat
    this.notificationService.clearUnread(this.otherUserId);

    this.loadUserData(this.otherUserId);
    this.loadMessageHistory();

    this.chatService.connect(this.currentUserId, this.otherUserId);

    this.chatService.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msg) => {
        this.messages.update(msgs => [...msgs, msg]);
        this.shouldScroll = true;
      });

    this.chatService.connectionStatus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((connected) => {
        this.isConnected.set(connected);
      });

    effect(() => {
      if (this.shouldScroll) {
        this.scrollToBottom();
        this.shouldScroll = false;
      }
    });
  }

  loadUserData(userId: number): void {
    // Cargar datos del usuario desde la API o usar mock
    this.userAPI.getUserById(userId).subscribe({
      next: (user: any) => {
        this.userName.set(user.name || `Usuario ${userId}`);
        this.userAvatar.set(user.avatar || 'https://randomuser.me/api/portraits/women/1.jpg');
        this.isOnline.set(false);
      },
      error: () => {
        // Fallback a datos mock
        const users: Record<number, { name: string; avatar: string; online: boolean }> = {
          1: { name: 'Jamie', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', online: true },
          2: { name: 'Vicky', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', online: false },
        };
        const user = users[userId] || { name: `Usuario ${userId}`, avatar: '', online: false };
        this.userName.set(user.name);
        this.userAvatar.set(user.avatar);
        this.isOnline.set(user.online);
      }
    });
  }

  loadMessageHistory(): void {
      if(development){
          this.http.get<ChatMessage[]>(`http://localhost:8000/api/chat/messages/${this.currentUserId}/${this.otherUserId}/`)
              .subscribe({
                  next: (messages) => {
                      console.log('📜 Historial cargado:', messages.length, 'mensajes');
                      this.messages.set(messages);
                  },
                  error: (err) => {
                      console.error('Error cargando historial:', err);
                  }
              });
      } else {
          this.http.get<ChatMessage[]>(`${window.location.origin}/api/chat/messages/${this.currentUserId}/${this.otherUserId}/`)
              .subscribe({
                  next: (messages) => {
                      console.log('📜 Historial cargado:', messages.length, 'mensajes');
                      this.messages.set(messages);
                  },
                  error: (err) => {
                      console.error('Error cargando historial:', err);
                  }
              });
      }




  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.isConnected()) {
      this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
      this.shouldScroll = true;
    }
  }

  goBack(): void {
    this.router.navigate(['/chats']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile', this.otherUserId]);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  blockUser(): void {
    const baseUrl = development ? 'http://localhost:8000' : window.location.origin;
    this.http.post(`${baseUrl}/api/users/block/`, {
      id_logged_user: this.currentUserId,
      id_blocked_user: this.otherUserId,
      reason: 'Bloqueado desde el chat'
    }, {
      headers: { Authorization: 'Bearer ' + this.userAPI.getToken() }
    }).subscribe({
      next: () => {
        this.menuOpen = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al bloquear:', err);
      }
    });
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer();
    if (container) {
      container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
    }
  }
}
