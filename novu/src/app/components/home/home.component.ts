import { afterNextRender, Component, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserAPIService } from '../../services/user-api.service';
import { PanelServiceService } from '../../services/panel-service.service';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { CardTab } from '../../services/card-tab.service';
import { development } from '../../baseURLconfig';
import { LikedPanelComponent } from '../liked-panel/liked-panel.component';
import { LikedPanelServiceService } from '../../services/liked-panel-service.service';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
}

interface Study {
  name: string;
  currently_studying: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  surnames: string;
  gender: string;
  height: number;
  age: number;
  date_of_birth: string;
  amount_tabs: number;
  is_new: boolean;
  tabs: CardTab[];
  interests: Interest[];
  school_name: string;
  profile_pic: string | null;
  studies: Study[];
  likes: number;
  restricted: boolean;
}

interface Interest {
  name: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FilterPanelComponent, LikedPanelComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  private http = inject(HttpClient);

  userProfiles: UserProfile[]    = [];
  allUserProfiles: UserProfile[] = [];
  profiles: Profile[]            = [];
  currentIndex                   = 0;
  currentTabIndex = signal<Record<number, number>>({});
  matchedProfile  = signal<UserProfile | null>(null);
  loading         = true;
  error           = '';
  hasSeenAll      = false;
  studies: Study[] = [];

  isDragging   = false;
  dragX        = 0;
  dragStartX   = 0;
  isLoggedIn: boolean;

  loggedUser = signal<UserProfile>({
    age: 0, amount_tabs: 0, date_of_birth: '', gender: '', height: 0,
    id: 0, interests: [], is_new: false, name: 'YO', profile_pic: 'assets/Images/userIcon.svg',
    school_name: '', surnames: '', tabs: [], studies: [], likes: 0, restricted: false,
  });

  private likeAnimation    = false;
  private dislikeAnimation = false;

  constructor(
    private userAPIService: UserAPIService,
    private router: Router,
    public filterPanel: PanelServiceService,
    public likesPanel: LikedPanelServiceService
  ) {
    this.isLoggedIn = this.userAPIService.isLoggedIn();
    this.filterPanel.onApply = () => this.applyFilters();

    if (this.userAPIService.getToken() == null) {
      this.router.navigateByUrl('');
    }

    const isTokenExpired =
      this.userAPIService.isTokenExpired(this.userAPIService.getToken()!) != null
        ? this.userAPIService.isTokenExpired(this.userAPIService.getToken()!)
        : true;

    if (!this.isLoggedIn || isTokenExpired) {
      localStorage.removeItem('access_token');
      this.router.navigateByUrl('');
    }

    this.userAPIService.getUserById(this.userAPIService.getUserId()!).subscribe({
      next: data => {
        const user = data as UserProfile;
        if (user.restricted) this.router.navigateByUrl('');
        if (user.is_new) this.router.navigateByUrl('/studies');
      }
    });

    this.retrieveUsers();

    afterNextRender(() => {
      const token  = this.userAPIService.decodeToken();
      const userID = token.user_id;

      //  carga el perfil del usuario logueado 
      this.userAPIService.getUserProfile(Number(userID)).subscribe({
        next: (data) => { this.loggedUser.set(data); },
        error: () => {}
      });

      //  eliminado el segundo getUserProfiles() que sobreescribía
      //    userProfiles sin actualizar allUserProfiles 
    });
  }

  ngOnDestroy(): void {
    this.filterPanel.onApply = null;
  }

  //  Helpers 
  getProfilePicture(): string {
    return development
      ? `http://localhost:8000/${this.loggedUser().profile_pic}`
      : `${window.location.origin}/${this.loggedUser().profile_pic}`;
  }

  randomizeProfiles(array: UserProfile[]): UserProfile[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  ageSecurityFilter(): UserProfile[] {
    if (this.loggedUser().age < 18) {
      return this.userProfiles.filter(u => u.age < 18);
    }
    return this.userProfiles;
  }

  //  For You Page 
  retrieveUsers(): void {
    const token  = this.userAPIService.decodeToken();
    const userID = Number(token.user_id);
    const userMatches: { id: number; active: boolean; user1_id: number; user2_id: number }[] = [];

    this.userAPIService.checkMatch(userID).subscribe(res => {
      res.forEach(match => {
        if (!userMatches.some(m => m.id === match.id)) userMatches.push(match);
      });

      this.userAPIService.getUserProfiles().subscribe({
        next: (data: any) => {
          let filtered = (data as UserProfile[]).filter(
            user => user.tabs != null && user.id !== userID && !user.is_new && !user.restricted
          );

          userMatches.forEach(match => {
            filtered = filtered.filter(
              u => u.id !== match.user1_id && u.id !== match.user2_id
            );
          });

          const randomized = this.randomizeProfiles(filtered);

          //  ambos parten de la misma base procesada 
          this.userProfiles    = [...randomized];
          console.log(this.userProfiles);
          this.userProfiles    = this.ageSecurityFilter();
          console.log(this.userProfiles);
          this.allUserProfiles = [...this.userProfiles]; // ← copia DESPUÉS del ageSecurityFilter
          console.log(this.allUserProfiles);
          this.loading         = false;
        },
        error: () => {
          this.error   = 'No se pudieron cargar los perfiles';
          this.loading = false;
        }
      });
    });
  }

  //  Filtros 
  applyFilters(): void {
    if (this.allUserProfiles.length === 0) return;

    const f                = this.filterPanel.filters;
    const hasInterestSearch = this.filterPanel.interestSearch.trim() !== '';
    const hasStudySearch    = this.filterPanel.studySearch.trim() !== '';
    this.currentIndex      = 0;
    this.hasSeenAll        = false;

    this.userProfiles = [...this.allUserProfiles.filter(user => {

      // Edad
      const ageOk = user.age >= f.ageMin && user.age <= f.ageMax;

      // Intereses
      let interestsOk = true;
      if (f.interests.length > 0) {
        const names = (user.interests ?? []).map(i => i.name.toLowerCase());
        interestsOk = f.interests.some(sel => names.includes(sel.toLowerCase()));
      } else if (hasInterestSearch) {
        interestsOk = false;
      }

      // Estudios
      let studiesOk = true;
      if (f.studies.length > 0) {
        const names = (user.studies ?? []).map(s => s.name.toLowerCase());
        studiesOk = f.studies.some(sel => names.includes(sel.toLowerCase()));
      } else if (hasStudySearch) {
        studiesOk = false;
      }

      return ageOk && interestsOk && studiesOk;
    })];
  }

  //  Card tabs 
  getCurrentTabIndex(profileId: number): number {
    return this.currentTabIndex()[profileId] ?? 0;
  }

  getCurrentTab() {
    const profile = this.getCurrentProfile();
    if (!profile) return null;
    const idx = this.getCurrentTabIndex(profile.id);
    return profile.tabs[idx] ?? profile.tabs[0];
  }

  nextTab(profileId: number, totalTabs: number, event: Event): void {
    event.stopPropagation();
    this.currentTabIndex.update(map => ({
      ...map,
      [profileId]: ((map[profileId] ?? 0) + 1) % totalTabs
    }));
  }

  prevTab(profileId: number, totalTabs: number, event: Event): void {
    event.stopPropagation();
    this.currentTabIndex.update(map => ({
      ...map,
      [profileId]: Math.max((map[profileId] ?? 0) - 1, 0)
    }));
  }

  //  Perfil actual 
  getCurrentProfile(): UserProfile | null {
    return this.userProfiles[this.currentIndex] ?? null;
  }

  getCurrentBackgroundPicture(): string {
    const tab = this.getCurrentTab();
    if (!tab?.background_photo) return 'assets/Images/backgroundless_cardtab.svg';
    return development
      ? `http://localhost:8000/${tab.background_photo}`
      : `${window.location.origin}/${tab.background_photo}`;
  }

  getCardRotation(): string {
    return `translateX(${this.dragX}px) rotate(${this.dragX * 0.08}deg)`;
  }

  isLiking():    boolean { return this.likeAnimation    || this.dragX >  40; }
  isDisliking(): boolean { return this.dislikeAnimation || this.dragX < -40; }

  //  Mouse / Touch 
  onMouseDown(e: MouseEvent): void  { this.isDragging = true; this.dragStartX = e.clientX; }
  onMouseMove(e: MouseEvent): void  { if (this.isDragging) this.dragX = e.clientX - this.dragStartX; }
  onMouseUp(): void                 { if (this.isDragging) this._resolveSwipe(); }

  onTouchStart(e: TouchEvent): void { this.isDragging = true; this.dragStartX = e.touches[0].clientX; }
  onTouchMove(e: TouchEvent): void  { if (this.isDragging) this.dragX = e.touches[0].clientX - this.dragStartX; }
  onTouchEnd(): void                { if (this.isDragging) this._resolveSwipe(); }

  private _resolveSwipe(): void {
    this.isDragging = false;
    if      (this.dragX >  80) this.like();
    else if (this.dragX < -80) this.dislike();
    else                       this.dragX = 0;
  }

  //  Like / Dislike 
  like(): void {
    const profile = this.getCurrentProfile();
    if (!profile) return;

    this.likeAnimation = true;
    setTimeout(() => { this.likeAnimation = false; }, 300);

    const originUserId = Number(this.userAPIService.decodeToken()?.user_id);
    if (!originUserId) { this.resetAndNext(); return; }

    this._clearTabIndex(profile.id);
    this.userAPIService.registerSwipe(originUserId, profile.id, true).subscribe({
      next: (response: any) => {
        if (response.match_created) this.showMatchNotification(profile);
        this.resetAndNext();
      },
      error: () => this.resetAndNext()
    });
  }

  dislike(): void {
    const profile = this.getCurrentProfile();
    if (!profile) return;

    this.dislikeAnimation = true;
    setTimeout(() => { this.dislikeAnimation = false; }, 300);

    const originUserId = this.userAPIService.decodeToken()?.user_id;
    if (!originUserId) { this.resetAndNext(); return; }

    this._clearTabIndex(profile.id);
    this.userAPIService.registerSwipe(originUserId, profile.id, false).subscribe({
      next:  () => this.resetAndNext(),
      error: () => this.resetAndNext()
    });
  }

  private _clearTabIndex(profileId: number): void {
    this.currentTabIndex.update(map => {
      const next = { ...map };
      delete next[profileId];
      return next;
    });
  }

  private resetAndNext(): void {
    this.dragX = 0;
    if (this.currentIndex < this.userProfiles.length - 1) this.currentIndex++;
    else {
      this.hasSeenAll = true;
      console.log('No hay más perfiles para mostrar');
    }
  }

  preivousProfile(): void {
    if (this.currentIndex <= 0) { this.currentIndex = 0; return; }
    this.currentIndex--;
  }

  showMatchNotification(profile: UserProfile): void {
    setTimeout(() => {
      this.matchedProfile.set(profile);
      setTimeout(() => this.matchedProfile.set(null), 3000);
    }, 100);
  }

  reloadProfiles(): void {
    this.loading = true;
    this.error   = '';
    this.retrieveUsers();
  }

  //  Navegación 
  goToChat():    void { this.router.navigate(['/chats']); }
  goToProfile(): void { this.router.navigateByUrl('/settings'); }
  goToWelcome(): void { this.router.navigate(['']); }

  toggleLikesPanel(): void { this.likesPanel.toggle(); }

  toggleFilters(): void {
    if (!this.filterPanel.isOpen) this.filterPanel.open();
    else                          this.filterPanel.close();
  }

  protected readonly development = development;
  protected readonly window = window;
}