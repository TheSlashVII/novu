import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ChatPreview {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
  unreadCount: number;
  online: boolean;
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

  chats: ChatPreview[] = [
    {
      id: 1,
      name: 'Jamie',
      lastMessage: '3 New messages...',
      lastMessageTime: '',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      unreadCount: 3,
      online: true
    },
    {
      id: 2,
      name: 'Vicky',
      lastMessage: 'Sent 40 minutes ago',
      lastMessageTime: '40 min',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      unreadCount: 0,
      online: false
    },
    {
      id: 3,
      name: 'Carlos',
      lastMessage: '¿Nos vemos mañana?',
      lastMessageTime: '2h',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      unreadCount: 1,
      online: true
    },
    {
      id: 4,
      name: 'Ana',
      lastMessage: 'Gracias por todo!',
      lastMessageTime: '5h',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      unreadCount: 0,
      online: false
    }
  ];

  openChat(userId: number): void {
    this.router.navigate(['/chat', userId]);
  }
  
}
