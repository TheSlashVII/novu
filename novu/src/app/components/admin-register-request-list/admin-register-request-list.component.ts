import { Component } from '@angular/core';

export interface RegisterRequest {
    id: number;
    username: string;
    date: string;
}

@Component({
  selector: 'app-admin-register-request-list',
  imports: [],
  templateUrl: './admin-register-request-list.component.html',
  styleUrl: './admin-register-request-list.component.css',
    standalone: true,
})
export class AdminRegisterRequestListComponent {
    requests: RegisterRequest[] = [
        { id: 1, username: 'User 2', date: 'Date' },
        { id: 2, username: 'User 3', date: 'Date' },
        { id: 3, username: 'User 4', date: 'Date' },
        { id: 4, username: 'User 5', date: 'Date' },
        { id: 5, username: 'User 6', date: 'Date' },
    ];

    onLogout(): void {
        console.log('Logout clicked');
    }

    onViewDetails(request: RegisterRequest): void {
        console.log('View details for:', request);
    }

    onBackToPanel(): void {
        console.log('Back to panel clicked');
    }
}
