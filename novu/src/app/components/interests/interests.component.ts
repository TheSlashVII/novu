import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InterestApiService } from '../../services/interest-api.service';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [],
  templateUrl: './interests.component.html',
  styleUrl: './interests.component.css'
})
export class InterestsComponent {
  private router = inject(Router);
  private interestApi = inject(InterestApiService);

  interests: { id: number; label: string; selected: boolean }[] = [
    { id: 1, label: 'Ingenieria', selected: false },
    { id: 2, label: 'Tecnologia', selected: false },
    { id: 3, label: 'Videojuegos', selected: false },
    { id: 4, label: 'Viajar', selected: false },
    { id: 5, label: 'Coches', selected: false },
    { id: 6, label: 'Lifestyle', selected: false },
    { id: 7, label: 'Musica', selected: false },
    { id: 8, label: 'Deportes', selected: false },
    { id: 9, label: 'Pet lover', selected: false },
    { id: 10, label: 'Social Media', selected: false },
  ];

  hasSelection(): boolean {
    return this.interests.some(i => i.selected);
  }

  toggleInterest(interest: { id: number; label: string; selected: boolean }): void {
    interest.selected = !interest.selected;
  }

  goNext(): void {
    const selectedIds = this.interests
      .filter(i => i.selected)
      .map(i => i.label);

    const userId = 1; 

    this.interestApi.saveUserInterests(userId, selectedIds).subscribe({
      next: () => {
      
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error guardando intereses:', err);
      }
    });
  }
}