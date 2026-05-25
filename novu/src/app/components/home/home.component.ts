import { afterNextRender, Component, inject, signal } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {UserAPIService} from '../../services/user-api.service';
import {PanelServiceService} from '../../services/panel-service.service';
import {FilterPanelComponent} from '../filter-panel/filter-panel.component';
import {CardTab} from '../../services/card-tab.service';
import {development} from '../../baseURLconfig';
import {LikedPanelComponent} from '../liked-panel/liked-panel.component';
import {LikedPanelServiceService} from '../../services/liked-panel-service.service';

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
    height:number
    age: number;
    date_of_birth: string;
    amount_tabs:number;
    is_new: boolean;
    tabs:CardTab[];
    interests: Interest[];
    school_name:string;
    profile_pic:string | null;
    studies:Study[];
    likes:number;
    restricted:boolean;
}

interface Interest{
  name: string;
}



@Component({
  selector: 'app-home',
  standalone: true,
    imports: [FilterPanelComponent, LikedPanelComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private http = inject(HttpClient);
  userProfiles: UserProfile[] = [];
  allUserProfiles: UserProfile[] = [];
  profiles: Profile[] = [];
  currentIndex: number = 0;
    currentTabIndex = signal<Record<number, number>>({});
  loading: boolean = true;
  error: string = '';
    // hasWentBack:boolean = false;
    studies: Study[] = [];
    hasSeenAll:boolean = false;
  isDragging: boolean = false;
  dragX: number = 0;
  dragStartX: number = 0;
  isLoggedIn: boolean;
  loggedUser= signal<UserProfile>({
      age: 0,
      amount_tabs: 0,
      date_of_birth: "",
      gender: "",
      height: 0,
      id: 0,
      interests: [],
      is_new: false,
      name: "YO",
      profile_pic: "assets/Images/userIcon.svg",
      school_name: "",
      surnames: "",
      tabs: [],
      studies:[],
      likes:0,
      restricted:false,
  });
  private likeAnimation: boolean = false;
  private dislikeAnimation: boolean = false;

    /**
     * Used to toggle the liked users panel
      */
  toggleLikesPanel(): void {
        this.likesPanel.toggle();
    }
  randomizeProfiles(array:UserProfile[]){
      let newArray:UserProfile[] = array;
      for (let i = 0; i < array.length; i++) {
          let randomIndex = Math.floor(Math.random() * (i+1));
          [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]];
      }
      return newArray;
  }

    /**
     * function used to filter users in case the user is underage
     */
  ageSecurityFilter(){
      let tempArr:UserProfile[] = this.userProfiles;
      if(this.loggedUser().age < 18){
          tempArr = tempArr.filter((currentUser:UserProfile) => currentUser.age < 18);
          return tempArr;
      }
      return tempArr;
  }
  constructor(private userAPIService: UserAPIService, private router:Router, public filterPanel:PanelServiceService, public likesPanel:LikedPanelServiceService) {
      this.isLoggedIn = this.userAPIService.isLoggedIn();
      this.filterPanel.onApply = () => this.applyFilters();
        if(this.userAPIService.getToken() == null){
            this.router.navigateByUrl('');
        }

      const isTokenExpired = this.userAPIService.isTokenExpired(this.userAPIService.getToken()!) != null ? this.userAPIService.isTokenExpired(this.userAPIService.getToken()!) : true;
      if (!this.isLoggedIn || isTokenExpired){
          localStorage.removeItem('access_token');
          this.router.navigateByUrl('');


    }
      this.userAPIService.getUserById(this.userAPIService.getUserId()!).subscribe({
          next: data => {
              let user:UserProfile = (data as UserProfile);
              if(user.restricted){this.router.navigateByUrl('');}
              if(user.is_new){this.router.navigateByUrl('/studies')}
          }
      })
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
        this.userAPIService.getUserProfile(Number(userID)).subscribe({
            next: (data) => {
                this.loggedUser.set(data)
            }, error: (error) => {

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
    getProfilePicture(){
      return development ? `http://localhost:8000/${this.loggedUser().profile_pic}` : `${window.location.origin}/${this.loggedUser().profile_pic}`;
    }
    // for you page algorithm
    retrieveUsers(){
      const token = this.userAPIService.decodeToken()
      const userID = Number(token.user_id);
      const userMatches:{id:number, active:boolean, user1_id:number, user2_id:number}[] = []
      this.userAPIService.checkMatch(Number(userID)).subscribe(res => {
        // adds user ids that are not from the logged user
        res.forEach(match => {
            if (!userMatches.some(existingMatch => existingMatch.id === match.id )){
                userMatches.push(match)
            }
        })


        this.userAPIService.getUserProfiles().subscribe({
                next: (data: any) => {
                    let filtered = (data as UserProfile[]).filter(
                        user => user.tabs != null && user.id != userID && user.is_new == false && user.restricted == false
                    );

                    userMatches.forEach(currentExistingMatch => {
                        // filters already matched users
                        filtered = filtered.filter((currentUser) =>  currentUser.id != currentExistingMatch.user1_id && currentUser.id != currentExistingMatch.user2_id );
                    })



                    this.allUserProfiles = this.randomizeProfiles(filtered); // randomizes the users
                    this.userProfiles = [...filtered];
                    this.userProfiles = this.ageSecurityFilter() // if the user is less than 18 he will get a feed limited to 17 years old
                    this.loading = false;
                },
                error: () =>{
                    this.error = 'No se pudieron cargar los perfiles';
                    this.loading = false;

                }
            }
        )

        })

    }

    // card tab functionality
    /**
     * Used to get the current tab for the current user card
     * @param profileId
     */
    getCurrentTabIndex(profileId: number): number {
        return this.currentTabIndex()[profileId] ?? 0;
    }

    /**
     * Used to go to the next card tab
     * @param profileId
     * @param totalTabs
     * @param event
     */
    nextTab(profileId: number, totalTabs: number, event: Event): void {
        event.stopPropagation(); // prevent triggering drag
        this.currentTabIndex.update(map => ({
            ...map,
            [profileId]: ((map[profileId] ?? 0) + 1) % totalTabs
        }));
    }

    /**
     * Used to get the current card tab
     */
    getCurrentTab() {
        const profile = this.getCurrentProfile();
        if (!profile) return null;
        const idx = this.getCurrentTabIndex(profile.id);
        return profile.tabs[idx] ?? profile.tabs[0];
    }
    prevTab(profileId: number, totalTabs: number, event: Event): void {
        event.stopPropagation();
        this.currentTabIndex.update(map => ({
            ...map,
            [profileId]: Math.max((map[profileId] ?? 0) - 1, 0)
        }));
    }


  //Filtros
  applyFilters(): void {
    const f = this.filterPanel.filters;
    console.log('Filtros aplicados:', f);
    console.log('Total perfiles antes:', this.allUserProfiles.length);
    console.log('Primer usuario:', this.allUserProfiles[0]);
    this.currentIndex = 0;

    this.userProfiles = [ ...this.allUserProfiles.filter(user => {
      const ageOk = user.age >= f.ageMin && user.age <= f.ageMax;
      console.log(`${user.name} - edad: ${user.age} - ageOk: ${ageOk}`);
      console.log(`${user.name} - interests:`, user.interests);
      console.log(`${user.name} - studies:`, user.studies);

      let interestsOk = true;
      if (f.interests.length > 0) {
        const userInterestNames = (user.interests ?? []).map(i => i.name.toLowerCase());
        interestsOk = f.interests.some(sel => userInterestNames.includes(sel.toLowerCase()))
      }

      // Estudios: el usuario debe tener al menos uno de los seleccionados
      let studiesOk = true;
      if (f.studies.length > 0) {
        const userStudyNames = (user.studies ?? []).map(s => s.name.toLowerCase());
        studiesOk = f.studies.some(sel => userStudyNames.includes(sel.toLowerCase()));
      }

      return ageOk && interestsOk && studiesOk;
    })]
    console.log('Total perfiles después:', this.userProfiles.length);
  }


  getCurrentProfile(): UserProfile | null {
    return this.userProfiles[this.currentIndex] ?? null;
  }

  getCurrentBackgroundPicture(){
        /*
      let user = this.getCurrentProfile();
      let bg:string | File = user?.tabs[tab].background_photo!;
      if(bg != null){
          return development ? `http://localhost:8000/${user?.tabs[tab].background_photo!} ` : `${window.location.origin}/${user?.tabs[tab].background_photo!}`
      }
      return "assets/Images/backgroundless_cardtab.svg";

         */
      const profile = this.getCurrentProfile();
      if (!profile) return 'assets/Images/backgroundless_cardtab.svg';
      const tab = this.getCurrentTab();
      if (development){
          return tab?.background_photo != null ? `http://localhost:8000/${tab?.background_photo}` : 'assets/Images/backgroundless_cardtab.svg';
      }
      return `${window.location.origin}/${tab?.background_photo}` || 'assets/Images/backgroundless_cardtab.svg';
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
    if (!this.isDragging) return;
    this.dragX = e.clientX - this.dragStartX;
  }

  onMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragX > 80) {
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
    if (!this.isDragging) return;
    this.dragX = e.touches[0].clientX - this.dragStartX;
  }

  onTouchEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragX > 80) {
      this.like();
    } else if (this.dragX < -80) {
      this.dislike();
    } else {
      this.dragX = 0;
    }
  }

  like(): void {
    const profile = this.getCurrentProfile();
    if (!profile) return;

    this.likeAnimation = true;
    setTimeout(() => { this.likeAnimation = false; }, 300);

    const originUserId = Number(this.userAPIService.decodeToken()?.user_id);
    if (!originUserId) { this.resetAndNext(); return; }

    this.userAPIService.registerSwipe(originUserId, profile.id, true).subscribe({
      next: (response: any) => {
        if (response.match_created) this.showMatchNotification(profile);
        this.resetAndNext();
      },
      error: () => this.resetAndNext()
    })
      // wherever you advance to the next profile:
      this.currentTabIndex.update(map => {
          const next = { ...map };
          delete next[profile.id];
          return next;
      });
  }

  dislike(): void {
    const profile = this.getCurrentProfile();
    if (!profile) return;

    this.dislikeAnimation = true;
    setTimeout(() => { this.dislikeAnimation = false; }, 300);

    const originUserId = this.userAPIService.decodeToken()?.user_id;
    if (!originUserId) { this.resetAndNext(); return; }

    this.userAPIService.registerSwipe(originUserId, profile.id, false).subscribe({
      next: () => this.resetAndNext(),
      error: () => this.resetAndNext()
    });
      // wherever you advance to the next profile:
      this.currentTabIndex.update(map => {
          const next = { ...map };
          delete next[profile.id];
          return next;
      });
  }

  //Metodo para resetear y pasar al siguiente perfil
  private resetAndNext(): void {
    this.dragX = 0;
    if (this.currentIndex < this.userProfiles.length - 1) this.currentIndex++;
    else {
        this.hasSeenAll = true;
        console.log('No hay más perfiles para mostrar')
    }
  }

  //Metodo para pasar al siguiente perfil
  nextProfile(): void {
    if (this.currentIndex < this.profiles.length - 1) {
      this.currentIndex++;
    } else {
      //No hay mas perfiles
      console.log('No hay mas perfiles para mostrar')
    }
  }
  preivousProfile(){
      if (this.currentIndex <= 0 ){
          this.currentIndex = 0;
          return;
      }
      this.currentIndex--;
  }

  //Mostrar notificación de match
  showMatchNotification(profile: UserProfile): void {
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

    goToWelcome(): void { this.router.navigate(['']); }
  toggleFilters() {
    this.filterPanel.isOpen = !this.filterPanel.isOpen
  }

    protected readonly development = development;
    protected readonly window = window;
}
