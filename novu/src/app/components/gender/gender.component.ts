import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {UserAPIService} from '../../services/user-api.service';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [],
  templateUrl: './gender.component.html',
  styleUrl: './gender.component.css'
})
export class GenderComponent {

  constructor(private userAPI:UserAPIService, private router:Router) {
  }
  genders: { id: number; label: string; selected: boolean }[] = [
    { id: 1, label: 'Hombre', selected: false },
    { id: 2, label: 'Mujer', selected: false },
    { id: 3, label: 'Otros', selected: false },
  ];

  hasSelection(): boolean {
    return this.genders.some(i => i.selected);
  }

  toggleGender(gender: { id: number; label: string; selected: boolean }): void {
      gender.selected = !gender.selected;
      if (gender.id == 1) {
          this.genders[1].selected = false;
          this.genders[2].selected = false;
      } else if (gender.id == 2) {
          this.genders[0].selected = false;
          this.genders[2].selected = false;
      } else if (gender.id == 3) {
          this.genders[0].selected = false;
          this.genders[1].selected = false;
      }


  }

  goNext(): void {
    const selectedIds = this.genders
      .filter(i => i.selected)
      .map(i => i.label);

      const token = this.userAPI.decodeToken();
    const userId = Number(token.user_id)
      this.userAPI.updateUserGender(userId, selectedIds[0]).subscribe({
          next: (next) => {
              this.router.navigateByUrl("/card_creation")
          }, error: (error) => {
              console.log(error);
          }
      })

/*
    this.interestApi.saveUserInterests(userId, selectedIds).subscribe({
      next: () => {
        this.userAPI.updateIsUserNewStatus(userId).subscribe(res=>console.log(res))
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error guardando intereses:', err);
      }
    });

 */
  }
}
