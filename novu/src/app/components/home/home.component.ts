import {Component, inject, afterNextRender, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';
import { PanelServiceService } from '../../services/panel-service.service';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
}

export interface UserProfile {
    id: number;
    name: string;
    age: number;
    date_of_birth: string;
    amount_tabs:number;
    tabs:CardTab[];
    interests: Interest[];
}

interface CardTab {
  id: number;
  card: number;
  header: string;
  sub_header: string;
  body: string;
  tab_biography: string;
  background_photo: string;
}

interface Interest{
  name: string;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FilterPanelComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private http = inject(HttpClient);
  userProfiles: UserProfile[] = [];
  allUserProfiles: UserProfile[] = [];
  profiles: Profile[] = [];
  currentIndex: number = 0;
  loading: boolean = true;
  error: string = '';
    hasWentBack:boolean = false;
  isDragging: boolean = false;
  dragX: number = 0;
  dragStartX: number = 0;
  isLoggedIn: boolean;
  private likeAnimation: boolean = false;
  private dislikeAnimation: boolean = false;


  constructor(private userAPIService: UserAPIService, private router:Router, public filterPanel:PanelServiceService) {
      this.isLoggedIn = this.userAPIService.isLoggedIn();
      this.filterPanel.onApply = () => this.applyFilters();
        if(this.userAPIService.getToken() == null){
            this.router.navigateByUrl('');
        }
      const isTokenExpired = this.userAPIService.isTokenExpired(this.userAPIService.getToken()!) != null ? this.userAPIService.isTokenExpired(this.userAPIService.getToken()!) : true;
      if (!this.isLoggedIn || isTokenExpired){
          if (localStorage.getItem('token') != null) {
              localStorage.removeItem('access_token');
          }
          this.router.navigateByUrl('');


      }
      this.retrieveUsers()


    afterNextRender(() => {
        const token = this.userAPIService.decodeToken()
        const userID = token.user_id;
        this.userAPIService.getUserProfiles().subscribe({
            next: (data) => {
                this.userProfiles = data.filter(user => user.tabs != null && user.id != userID);
                // this.userProfiles = this.userProfiles.filter(user => user.tabs != null && user.id != userID);
                // console.log(this.userProfiles);
                this.loading = false;
            },
            error: () => {
                this.error = 'No se pudieron cargar los perfiles.';
                this.loading = false;
            }
        })
        /*
      this.http.get<Profile[]>('http://localhost:8000/api/users/list/').subscribe({
        next: (data) => {
          this.profiles = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar los perfiles.';
          this.loading = false;
        }
      });

         */
    });
  }
  
    // for you page algorithm
    retrieveUsers(){
      const token = this.userAPIService.decodeToken()
      const userID = token.user_id;

      this.userAPIService.getUserProfiles().subscribe({
          next: (data: any) => {
              const filtered = (data as UserProfile[]).filter(
                user => user.tabs != null && user.id != userID
              );
              this.allUserProfiles = filtered;
              this.userProfiles = [...filtered];
              this.loading = false;
          },
          error: () =>{
            this.error = 'No se pudieron cargar los perfiles';
            this.loading = false;
          }
      }
    )
    }

  
  //Filtros
  applyFilters(): void{
    const f = this.filterPanel.filters;
    this.currentIndex = 0;

    this.userProfiles = this.allUserProfiles.filter(user => {
      const ageOk = user.age >= f.ageMin && user.age <= f.ageMax;

      let interestsOk = true;
      if(f.interests.length > 0){
        const userInterestNames = (user.interests ?? []).map(i => i.name.toLowerCase());
        interestsOk = f.interests.some(sel => userInterestNames.includes(sel.toLowerCase()))
      }

      return ageOk && interestsOk;
    })

    this.filterPanel.close()
  }


  getCurrentProfile(): UserProfile | null {
    return this.userProfiles[this.currentIndex] ?? null;
  }

  getCurrentBackgroundPicture(tab:number = 0){
      let user = this.getCurrentProfile();
      let bg:string = user?.tabs[tab].background_photo!;
      if(bg != null){
          return `${window.location.origin}/${user?.tabs[tab].background_photo!}`
      }
      return "assets/Images/backgroundless_cardtab.svg";
  }


  getCardRotation(): string {
    const deg = this.dragX * 0.08;
    return `translateX(${this.dragX}px) rotate(${deg}deg)`;
  }

  isLiking(): boolean { return this.likeAnimation || this.dragX > 40; }
  isDisliking(): boolean { return this.dislikeAnimation || this.dragX < -40; }

  onMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = e.clientX;
  }

  onMouseMove(e: MouseEvent): void {
    if(!this.isDragging) return;
    this.dragX = e.clientX - this.dragStartX;
  }

  onMouseUp(): void {
    if(!this.isDragging) return;
    this.isDragging = false;
    if(this.dragX > 80) {
      this.like();
    } else if (this.dragX < -80) {
      this.dislike();
    } else {
      this.dragX = 0;
    }
  }

  onTouchStart(e: TouchEvent): void {
    this.isDragging = true;
    this.dragStartX = e.touches[0].clientX;
  }

  onTouchMove(e: TouchEvent): void {
    if(!this.isDragging) return;
    this.dragX = e.touches[0].clientX - this.dragStartX;
  }

  onTouchEnd(): void {
    if(!this.isDragging) return;
    this.isDragging = false;
    if(this.dragX > 80) {
      this.like();
    } else if(this.dragX < -80) {
      this.dislike();
    } else {
      this.dragX = 0;
    }
  }

   like(): void {
    const profile = this.getCurrentProfile();
    if(!profile) return;

    this.likeAnimation = true;
    setTimeout(()=>{this.likeAnimation = false;}, 300);

    const originUserId = Number(this.userAPIService.decodeToken()?.user_id);
    if(!originUserId){this.resetAndNext(); return;}

    this.userAPIService.registerSwipe(originUserId, profile.id, true).subscribe({
      next: (response: any) => {
        if(response.match_created) this.showMatchNotification(profile);
        this.resetAndNext();
      },
      error: () => this.resetAndNext()
    })
  }

  dislike(): void {
    const profile = this.getCurrentProfile();
    if (!profile) return;
 
    this.dislikeAnimation = true;
    setTimeout(() => { this.dislikeAnimation = false; }, 300);
 
    const originUserId = this.userAPIService.decodeToken()?.user_id;
    if (!originUserId) { this.resetAndNext(); return; }
 
    this.userAPIService.registerSwipe(originUserId, profile.id, false).subscribe({
      next:  () => this.resetAndNext(),
      error: () => this.resetAndNext()
    });
  }

  //Metodo para resetear y pasar al siguiente perfil
  private resetAndNext(): void{
    this.dragX = 0;
    if (this.currentIndex < this.userProfiles.length - 1) this.currentIndex++;
    else console.log('No hay más perfiles para mostrar');
  }

  //Metodo para pasar al siguiente perfil
  nextProfile(): void {
    if(this.currentIndex < this.userProfiles.length -1){
      this.currentIndex++;
    }else{
      //No hay mas perfiles
      console.log('No hay mas perfiles para mostrar')
    }
  }
  preivousProfile(){
      if(this.hasWentBack){
          this.hasWentBack = false;
          return
      }
      if (this.currentIndex <= 0 ){
          this.hasWentBack = true;
          this.currentIndex = 0;
          return;
      }
      this.hasWentBack = true;
      this.currentIndex--;
  }

  //Mostrar notificación de match
  showMatchNotification(profile: UserProfile): void{
    // Usar setTimeout para evitar conflictos con la animacion
    setTimeout(() => {
      alert(`Hiciste match con ${profile.name}`);
    }, 100);
  }

  reloadProfiles(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Profile[]>('http://localhost:8000/api/users/list/').subscribe({
      next: (data) => {
        this.profiles = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los perfiles.';
        this.loading = false;
      }
    });
  }

  goToChat(): void { this.router.navigate(['/chats']); }
  goToProfile(): void { this.router.navigateByUrl('/settings'); }
  goToDiscover(): void { this.router.navigate(['/discover']); }
  toggleFilters(){
    this.filterPanel.isOpen = !this.filterPanel.isOpen
  }

}
