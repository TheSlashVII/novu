import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [NgClass],
  templateUrl: './interests.component.html',
  styleUrl: './interests.component.css'
})
export class InterestsComponent {
  private router = inject(Router);

  interests: { label: string; selected: boolean }[] = [
    { label: 'Ingenieria', selected: false },
    { label: 'Tecnologia', selected: false },
    { label: 'Videojuegos', selected: false },
    { label: 'Viajar', selected: false },
    { label: 'Coches', selected: false },
    { label: 'Lifestyle', selected: false },
    { label: 'Musica', selected: false },
    { label: 'Deportes', selected: false },
    { label: 'Pet lover', selected: false },
    { label: 'Social Media', selected: false },
  ];

  hasSelection(): boolean {
    return this.interests.some(i => i.selected);
  }

  getSelections(){
      return this.interests.filter(interests=> interests.selected == true);
  }

  toggleInterest(interest: { label: string; selected: boolean }): void {
    interest.selected = !interest.selected;
  }

  goNext(): void {
    this.router.navigate(['/home']);
  }
}
