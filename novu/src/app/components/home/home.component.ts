import { afterNextRender, Component, inject, signal } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {UserAPIService} from '../../services/user-api.service';
import {PanelServiceService} from '../../services/panel-service.service';
import {FilterPanelComponent} from '../filter-panel/filter-panel.component';
import {CardTab} from '../../services/card-tab.service';
import {development} from '../../baseURLconfig';

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
}

interface Interest{
  name: string;
}

interface Study {
  name: string;
  currently_studying: boolean;
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
    hasWentBack:boolean = false;  studies: Study[] = [];

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
      studies:[]

  });
  private likeAnimation: boolean = false;
  private dislikeAnimation: boolean = false;

  public randomizeProfiles(array:UserProfile[]){
      let newArray:UserProfile[] = array;
      for (let i = 0; i < array.length; i++) {
          let randomIndex = Math.floor(Math.random() * (i+1));
          [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]];
      }
      return newArray;
  }
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
        this.userAPIService.getUserProfile(Number(userID)).subscribe({
            next: (data) => {
                this.loggedUser.set(data)
            }, error: (error) => {
                console.log(error)
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
                        user => user.tabs != null && user.id != userID && user.is_new == false
                    );

                    userMatches.forEach(currentExistingMatch => {
                        // filters already matched users
                        filtered = filtered.filter((currentUser) =>  currentUser.id != currentExistingMatch.user1_id && currentUser.id != currentExistingMatch.user2_id );
                    })



                    this.allUserProfiles = this.randomizeProfiles(filtered); // randomizes the users
                    console.log(this.randomizeProfiles(filtered));
                    this.userProfiles = [...filtered];
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

  getCurrentBackgroundPicture(tab:number = 0){
      let user = this.getCurrentProfile();
      let bg:string | File = user?.tabs[tab].background_photo!;
      if(bg != null){
          return development ? `http://localhost:8000/${user?.tabs[tab].background_photo!} ` : `${window.location.origin}/${user?.tabs[tab].background_photo!}`
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
  }

  //Metodo para resetear y pasar al siguiente perfil
  private resetAndNext(): void {
    this.dragX = 0;
    if (this.currentIndex < this.userProfiles.length - 1) this.currentIndex++;
    else console.log('No hay más perfiles para mostrar');
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
  goToDiscover(): void { this.router.navigate(['/discover']); }
  toggleFilters() {
    this.filterPanel.isOpen = !this.filterPanel.isOpen
  }

    protected readonly development = development;
    protected readonly window = window;
}
