import { Component } from '@angular/core';
import {UserAPIService} from '../../services/user-api.service';
import {LikedPanelServiceService} from '../../services/liked-panel-service.service';
import {signal} from '@angular/core';
import {UserProfile} from '../home/home.component';
import {development} from '../../baseURLconfig';
@Component({
  selector: 'app-liked-panel',
  imports: [],
  templateUrl: './liked-panel.component.html',
  styleUrl: './liked-panel.component.css',
    standalone: true
})
export class LikedPanelComponent {

    constructor(private userAPI: UserAPIService, public likesPanel:LikedPanelServiceService) {
    }
    topProfiles = signal<UserProfile[]>([]);
    loading = signal(true);
    error   = signal('');

    ngOnInit(): void {
        this.fetchTopProfiles();
    }

    fetchTopProfiles(): void {
        this.loading.set(true);
        this.error.set('');
        this.userAPI.getMostLikedProfiles().subscribe({
            next: (data) => {
                this.topProfiles.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar los perfiles.');
                this.loading.set(false);
            }
        });
    }

    getProfilePic(profile: UserProfile): string {
        if (!profile.profile_pic) return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name) + '&background=7c3aed&color=fff';
        return development
            ? `http://localhost:8000/${profile.profile_pic}`
            : `${window.location.origin}/${profile.profile_pic}`;
    }

    close(): void {
        this.likesPanel.close();
    }

}
