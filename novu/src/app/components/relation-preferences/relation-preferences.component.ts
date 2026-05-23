import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserAPIService } from '../../services/user-api.service';
import { RelationShipPreferencesService } from '../../services/relation-ship-preferences.service';
import {UserProfile} from '../home/home.component';

@Component({
  selector: 'app-relation-preferences',
  imports: [],
  templateUrl: './relation-preferences.component.html',
  styleUrl: './relation-preferences.component.css'
})
export class RelationPreferencesComponent {
  errorMessage:string = ''
  isErrorMessageDisplaying:boolean = false;
  constructor (private userApi:UserAPIService, private relationshipApi:RelationShipPreferencesService, private router:Router){
      this.userApi.getUserById(this.userApi.getUserId()!).subscribe({
          next: value =>{
              let user:UserProfile = (value as UserProfile); // cast the type into UserProfile
              if (!user.is_new){
                  this.router.navigate(["/home"])
              }
          }

      })
  }

  preferences: {id:number; label:string; selected:boolean }[] = [
    {id: 1, label: 'Pareja a largo plazo', selected: false},
    {id: 2, label: 'Largo plazo', selected:false},
    {id: 3, label: 'Corto plazo', selected:false},
    {id: 4, label: 'Algo casual', selected:false},
    {id: 5, label: 'Nuevas amistades', selected:false},
    {id: 6, label: 'Todavía lo estoy descubriendo', selected:false}
];

hasSelection(): boolean{
  return this.preferences.some(p => p.selected)
}

//Solo una opción seleccionable a la vez
togglePreference(preference: {id: number; label: string; selected: boolean}): void {
  this.preferences.forEach(p => (p.selected = false));
  preference.selected = true;
}

goNext(): void{
  const selected = this.preferences.find(p => p.selected);
  if(!selected) return;

  const token = this.userApi.decodeToken();
  const userId = Number(token.user_id);

  this.relationshipApi.saveRelationshipPreferences(userId, selected.label).subscribe({
    next: () => {
      this.router.navigate(['/interests']);
    },
    error: (err) => {
        this.errorMessage = "Error guardando preferencia de relación"
      this.isErrorMessageDisplaying = true;
        setTimeout(() => {
            this.isErrorMessageDisplaying = false;
        }, 2000)
    }
  })
}

}
