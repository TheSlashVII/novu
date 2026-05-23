import { Component, inject, afterNextRender, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';
import { NotificationService } from '../../services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { baseChatURL, development } from '../../baseURLconfig';

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
  blockedUserIds = signal<number[]>([]);

  constructor() {
    afterNextRender(() => {
      this.notificationService.connect();

      const userId = this.userAPI.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      const baseUrl = development ? 'http://localhost:8000' : window.location.origin;

      this.http.get<{ blocked: number[] }>(`${baseUrl}/api/users/getBlockedIds/?user_id=${userId}`)
        .subscribe({
          next: (res) => {
            this.blockedUserIds.set(res.blocked);
          },
          error: () => {
          }
        });

      this.http.get<ChatPreview[]>(`${baseUrl}/api/chat/conversations/${userId}/`)
        .subscribe({
          next: (data) => {
            const chatsWithUnread = data.map(chat => ({
              ...chat,
              unreadCount: this.notificationService.unreadCounts[chat.id] || 0
            }));
            this.chats.set(chatsWithUnread);
            let updatedChats:ChatPreview[] = [];
            this.chats().forEach((chat) => {
                this.userAPI.getUserProfilePicture(chat.id).subscribe({
                    next: (res) => {
                        chat.avatar = development ? `http://localhost:8000/${res.profile_picture}` : `${window.location.origin}/${res.profile_picture}`;
                        updatedChats.push(chat);

                    },complete: ()=>{
                        console.log(updatedChats);
                        this.chats.set(updatedChats);
                    }
                })


            })

            console.log(updatedChats)
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


          if (this.blockedUserIds().includes(notification.sender_id)) return;

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

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
