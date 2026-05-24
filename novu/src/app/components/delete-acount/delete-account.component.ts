import { Component } from '@angular/core';
import {DeleteAccountModalServiceService} from '../../services/delete-account-modal-service.service';
import {UserAPIService} from '../../services/user-api.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-delete-acount',
    imports: [
        FormsModule
    ],
  templateUrl: './delete-account.component.html',
  styleUrl: './delete-account.component.css'
})
export class DeleteAccountComponent {

    confirmText: string  = '';
    isDeleting:  boolean = false;
    constructor(public modal:DeleteAccountModalServiceService, private userAPI: UserAPIService,  private router:Router) {
    }
    isConfirmed(): boolean {
        return this.confirmText.trim() === 'ELIMINAR';
    }

    cancel(): void {
        this.reset();
        this.modal.close();
    }

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement) === event.currentTarget) {
            this.cancel();
        }
    }

    confirmDelete(): void {
        if (!this.isConfirmed() || this.isDeleting) return;

        this.isDeleting = true;
        const userId = Number(this.userAPI.getUserId());

        this.userAPI.deleteUser(userId).subscribe({
            next: () => {
                this.isDeleting = false;
                this.reset();
                localStorage.removeItem('access_token');
                this.router.navigateByUrl('');
            },
            error: () => {
                this.isDeleting = false;
            }
        });
    }

    private reset(): void {
        this.confirmText = '';
        this.isDeleting  = false;
    }
}
