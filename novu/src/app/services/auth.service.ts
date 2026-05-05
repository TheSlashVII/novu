import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';

  constructor() { }

  /**
   * Inicia sesión y guarda el token
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap((response: any) => {
          if (response.access) {
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('user_id', response.user_id);
            console.log('✅ Login exitoso, token guardado');
          }
        })
      );
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : 1;
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verifica si el usuario está logueado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    console.log('🔓 Sesión cerrada');
  }
}