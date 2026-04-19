import { Component } from '@angular/core';

@Component({
  selector: 'app-interests',
  imports: [],
  templateUrl: './interests.component.html',
  styleUrl: './interests.component.css'
})
export class InterestsComponent {

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

  toggleInterest(interest: { label: string; selected: boolean }): void {
    interest.selected = !interest.selected;
  }

  getChipClass(interest: { label: string; selected: boolean }): string {
    const base =
      'px-8 py-3 rounded-full font-black text-base cursor-pointer transition-all duration-200 shadow-sm border-2 tracking-tight';
    if (interest.selected) {
      return `${base} bg-[#4a3d7a] text-white border-[#4a3d7a]`;
    }
    return `${base} bg-white text-black border-white hover:border-[#4a3d7a] hover:shadow-md`;
  }
}
