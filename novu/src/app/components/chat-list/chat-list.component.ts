import { Component, inject, afterNextRender, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';
import { NotificationService } from '../../services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private http = inject(HttpClient);
  private userAPI = inject(UserAPIService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  chats = signal<ChatPreview[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

   constructor() {
    afterNextRender(() => {
      this.notificationService.connect();

      const userId = this.userAPI.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }
/*
      this.http.get<ChatPreview[]>(`http://localhost:8000/api/chat/conversations/${userId}/`)
        .subscribe({
          next: (data) => {
            console.log('unreadCounts al cargar:', this.notificationService.unreadCounts);
            const chatsWithUnread = data.map(chat => ({
              ...chat,
              unreadCount: this.notificationService.unreadCounts[chat.id] || 0
            }));
            this.chats.set(chatsWithUnread);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error:', err);
            this.error.set('No se pudieron cargar las conversaciones.');
            this.loading.set(false);
          }
        });
 */

        this.http.get<ChatPreview[]>(`${window.location.origin}/api/chat/conversations/${userId}/`)
            .subscribe({
                next: (data) => {
                    console.log('unreadCounts al cargar:', this.notificationService.unreadCounts);
                    const chatsWithUnread = data.map(chat => ({
                        ...chat,
                        unreadCount: this.notificationService.unreadCounts[chat.id] || 0
                    }));
                    this.chats.set(chatsWithUnread);
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Error:', err);
                    this.error.set('No se pudieron cargar las conversaciones.');
                    this.loading.set(false);
                }
            });

        this.notificationService.notifications$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((notification) => {
          this.chats.update(chats => {
            const exists = chats.find(c => c.id === notification.sender_id);
            if (exists) {
              return chats.map(c =>
                c.id === notification.sender_id
                  ? { ...c, lastMessage: notification.message, unreadCount: (c.unreadCount || 0) + 1 }
                  : c
              );
            } else {
              return [...chats, {
                id: notification.sender_id,
                name: notification.sender_name,
                lastMessage: notification.message,
                lastMessageTime: '',
                avatar: '',
                unreadCount: 1
              }];
            }
          });
        });
    });
  }

  openChat(userId: number): void {
    this.notificationService.clearUnread(userId);
    this.chats.update(chats =>
      chats.map(c => c.id === userId ? { ...c, unreadCount: 0 } : c)
    );
    this.router.navigate(['/chat', userId]);
  }
}
