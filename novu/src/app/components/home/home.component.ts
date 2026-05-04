import {Component, inject, afterNextRender, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {UserAPIService} from '../../services/user-api.service';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
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
  constructor(private userAPI:UserAPIService, private router:Router) {
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

  isLiking(): boolean { return this.dragX > 40; }
  isDisliking(): boolean { return this.dragX < -40; }

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
    this.dragX = 500;
    setTimeout(() => {
      this.currentIndex++;
      this.dragX = 0;
    }, 350);
  }

  dislike(): void {
    this.dragX = -500;
    setTimeout(() => {
      this.currentIndex++;
      this.dragX = 0;
    }, 350);
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
  goToProfile(): void { this.router.navigate(['/profile']); }
  goToDiscover(): void { this.router.navigate(['/discover']); }
  goToSearch(): void { this.router.navigate(['/search']); }


}
