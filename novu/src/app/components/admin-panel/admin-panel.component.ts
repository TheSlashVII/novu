import { Component } from '@angular/core';
import { UserAPIService } from '../../services/user-api.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { development } from '../../baseURLconfig';

type requestCount = {
  request_count: number
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
  standalone: true
})
export class AdminPanelComponent {
  registerRequestsCount: number = 0;
  activeUserCount: number = 0;
  reportsCount: number = 0;
  restrictedUserCount: number = 0;

  constructor(private userAPI: UserAPIService, private router: Router, private http: HttpClient) {
    this.userAPI.getRegisterRequestCount().subscribe(res => {
      this.setRegisterRequestCount(res);
    });
    this.getActiveUserCount();
    this.getReportsCount();
    this.getRestrictedUserCount();
  }

  getRestrictedUserCount(){
      this.userAPI.adminGetRestrictedUserCount().subscribe(res => {
          this.restrictedUserCount = res.count
      })
  }
  getReportsCount(): void {
    const baseUrl = development ? 'http://localhost:8000' : window.location.origin;
    this.http.get<any[]>(`${baseUrl}/api/users/reports/`, {
      headers: { Authorization: 'Bearer ' + this.userAPI.getToken() }
    }).subscribe({
      next: (reports) => { this.reportsCount = reports.length; },
      error: (err) => console.error('Error cargando reportes:', err)
    });
  }

  goToRegisterRequestList() { this.router.navigateByUrl("/admin/request"); }
  goToReports() { this.router.navigateByUrl("/admin/reports"); }
  setRegisterRequestCount(data: any) { this.registerRequestsCount = data.request_count; }
  goToCreateUser() { this.router.navigateByUrl("/admin/create_user"); }
  logout() { this.userAPI.logoutJWT(); this.router.navigateByUrl(""); }
  goToRestrictUsers() { this.router.navigateByUrl("/admin/restrict_user"); }
  goToDeleteUsers() { this.router.navigateByUrl("/admin/delete_user"); }
  getActiveUserCount() { this.userAPI.adminGetActiveUserCount().subscribe(res => { this.activeUserCount = res.count; }); }
  goToUpdateUser() { this.router.navigateByUrl("/admin/update_user"); }
}
