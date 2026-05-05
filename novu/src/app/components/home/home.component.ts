import {Component, inject, afterNextRender, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
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



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private http = inject(HttpClient);

  profiles: Profile[] = [];
  currentIndex: number = 0;
  loading: boolean = true;
  error: string = '';

  isDragging: boolean = false;
  dragX: number = 0;
  dragStartX: number = 0;
    isLoggedIn: boolean;
  private likeAnimation: boolean = false;
  private dislikeAnimation: boolean = false;


  constructor(private userAPIService: UserAPIService, private userAPI:UserAPIService, private router:Router) {
      this.isLoggedIn = this.userAPI.isLoggedIn();
        if(this.userAPI.getToken() == null){
            this.router.navigateByUrl('');
        }
      const isTokenExpired = this.userAPI.isTokenExpired(this.userAPI.getToken()!) != null ? this.userAPI.isTokenExpired(this.userAPI.getToken()!) : true;
      if (!this.isLoggedIn || isTokenExpired){
          if (localStorage.getItem('token') != null) {
              localStorage.removeItem('access_token');
          }
          this.router.navigateByUrl('');


      }
    afterNextRender(() => {
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
    });
  }

  getCurrentProfile(): Profile | null {
    return this.profiles[this.currentIndex] ?? null;
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
    const currentProfile = this.getCurrentProfile();
    if(!currentProfile) return;

    // Mostrar animación de like
    this.likeAnimation = true;
    setTimeout(() => {
      this.likeAnimation = false;
    }, 300);

    // Registrar el like en la base de datos
    const token = this.userAPIService.decodeToken();
    const originUserId = Number(token?.user_id);
    const targetUserId = currentProfile.id;

    if(originUserId){
      this.userAPIService.registerSwipe(originUserId, targetUserId, true).subscribe({
        next: (response: any) => {
          console.log('Like registrado:', response);

          // Si hay match, mostrar notificación
          if(response.match_created){
            this.showMatchNotification(currentProfile);
          }

          // Resetear dragX y pasar al siguiente perfil
          this.resetAndNext();
        },
        error: (err) => {
          console.error('Error al registrar like:', err);
          this.resetAndNext();
        }
      });
    } else {
      this.resetAndNext();
    }
  }

  dislike(): void {
    const currentProfile = this.getCurrentProfile();
    if(!currentProfile) return;

    // Mostrar animación de NOPE
    this.dislikeAnimation = true;
    setTimeout(() => {
      this.dislikeAnimation = false;
    }, 300);

    // Registrar el SKIP en la base de datos
    const token = this.userAPIService.decodeToken();
    const originUserId = token?.user_id;
    const targetUserId = currentProfile.id;

    if(originUserId){
      this.userAPIService.registerSwipe(originUserId, targetUserId, false).subscribe({
        next: (response) => {
          console.log('kip registrado');
          this.resetAndNext();
        },
        error: (err) => {
          console.error('Error al registrar skip:', err);
          this.resetAndNext();
        }
      });
    } else {
      this.resetAndNext();
    }
  }

  //Metodo para resetear y pasar al siguiente perfil
  private resetAndNext(): void{
    this.dragX = 0;
    this.nextProfile();
  }

  //Metodo para pasar al siguiente perfil
  nextProfile(): void {
    if(this.currentIndex < this.profiles.length -1){
      this.currentIndex++;
    }else{
      //No hay mas perfiles
      console.log('No hay mas perfiles para mostrar')
    }
  }

  //Mostrar notificación de match
  showMatchNotification(profile: Profile): void{
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

  goToChat(): void { this.router.navigate(['/chat']); }
  goToProfile(): void { this.router.navigateByUrl('/settings'); }
  goToDiscover(): void { this.router.navigate(['/discover']); }
  goToSearch(): void { this.router.navigate(['/search']); }


}
