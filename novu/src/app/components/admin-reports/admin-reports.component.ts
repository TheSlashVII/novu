import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';
import { development } from '../../baseURLconfig';
import { FormControl, FormGroup } from '@angular/forms';
import { UserProfile } from '../home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
interface Report {
  id_reporter: number;
  reporter_name: string;
  id_reported: number;
  reported_name: string;
  reason: string;
  created_at: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css',
  imports:[ReactiveFormsModule]
})
export class AdminReportsComponent {
  private router = inject(Router);
  private http = inject(HttpClient);
  private userAPI = inject(UserAPIService);

  reports = signal<Report[]>([]);
  loading = signal(true);
  reviewingKey = signal<string>('');
  public searchBar = new FormGroup({
      name: new FormControl(''),
  })

  constructor() {
    this.loadReports();
  }

      submit() {
            const baseUrl = development ? 'http://localhost:8000' : window.location.origin;
        let searchedName:string = this.searchBar.value.name!
        if(searchedName.length > 0){
                this.http.get<Report[]>(`${baseUrl}/api/users/reports/`, {
      headers: { Authorization: 'Bearer ' + this.userAPI.getToken() }
    }).subscribe({
      next: (data) => {
        this.userAPI.listAllUsers(true).subscribe({
          next: res => {
            let users:any = res   
            // @ts-ignore    
            let u:UserProfile[] = res
          let filtered = u.filter(rep => rep.name.includes(searchedName) )
          let filteredReports:Report[] = []
          filtered.forEach(user => {
            filteredReports.push()
            filteredReports = data.filter(rep => rep.id_reported == user.id)
          })
        this.reports.set(filteredReports);
        this.loading.set(false);
          }
        })

      },
      error: (err) => {
        console.error('Error cargando reportes:', err);
        this.loading.set(false);
      }
    });
        } else {
          this.loadReports()
        }

    }

  loadReports(): void {
    const baseUrl = development ? 'http://localhost:8000' : window.location.origin;
    this.http.get<Report[]>(`${baseUrl}/api/users/reports/`, {
      headers: { Authorization: 'Bearer ' + this.userAPI.getToken() }
    }).subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reportes:', err);
        this.loading.set(false);
      }
    });
  }

  markReviewed(report: Report): void {
    const key = `${report.id_reporter}-${report.id_reported}`;
    this.reviewingKey.set(key);

    const baseUrl = development ? 'http://localhost:8000' : window.location.origin;
    this.http.patch(`${baseUrl}/api/users/markReportReviewed/`, {
      id_reporter: report.id_reporter,
      id_reported: report.id_reported
    }, {
      headers: { Authorization: 'Bearer ' + this.userAPI.getToken() }
    }).subscribe({
      next: () => {
        this.reports.update(reports => reports.filter(r =>
          !(r.id_reporter === report.id_reporter && r.id_reported === report.id_reported)
        ));
        this.reviewingKey.set('');
      },
      error: (err) => {
        console.error('Error marcando reporte:', err);
        this.reviewingKey.set('');
      }
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/admin');
  }
}
