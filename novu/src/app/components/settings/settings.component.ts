import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {UserAPIService} from '../../services/user-api.service';
import {UserProfile} from '../home/home.component';
import {CardTab} from '../../services/card-tab.service';
import {development} from '../../baseURLconfig';

export type SettingsSection = 'profile' | 'card';




export interface UserPreferences {
    maxDistanceKm: number;
    minAge: number;
    maxAge: number;
    goals: string[];
    showProfile: boolean;
    showDistance: boolean;
    showAge: boolean;
}

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.component.html',
    styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class SettingsComponent {
    loggedUserProfile: UserProfile | null = null;
    userID:number = 0
    cardTabSectionTracker:number = 0;
    constructor(private router:Router, private userAPI:UserAPIService) {
        const userID:number = Number(this.userAPI.decodeToken().user_id)
        this.userID = userID;
        this.userAPI.getUserProfile(userID).subscribe({
            next: result => {
                this.loggedUserProfile = result;
                this.profile.set({
                    amount_tabs: result.amount_tabs,
                    date_of_birth: result.date_of_birth,
                    gender: result.gender,
                    height: result.height,
                    id: result.id,
                    interests: result.interests,
                    is_new: false,
                    name: result.name,
                    profile_pic: development ? `http://localhost:8000/${result.profile_pic}` : `${window.location.origin}/${result.profile_pic}`,
                    school_name: result.school_name,
                    surnames: result.surnames,
                    tabs: result.tabs,
                    age:result.age,
                    studies: result.studies,
                })
                let c = this.profile().tabs[0]

                this.tabs.set([{
                    id_card: this.userID, id_section: c.id_section,
                    header: c.header,
                    sub_header: c.sub_header,
                    tab_biography: c.tab_biography,
                    background_photo: development ? `http://localhost:8000/${c.background_photo}` : `${window.location.origin}/${c.background_photo}`,
                    // background_photo: c.background_photo,
                }])
                this.profile().tabs.forEach(tab => {
                    /*
                    this.tabs.set([{
                        id_card: this.userID, id_section: tab.id_section,
                        header: tab.header,
                        sub_header: tab.sub_header,
                        tab_biography: tab.tab_biography,
                        background_photo: development ? `http://localhost:8000${tab.background_photo}` : `${window.location.origin}${c.background_photo}`,
                    }])
                     */
                    // checks if the section is the first one
                    if(tab.id_section != c.id_section) {
                        this.tabs.update(currentTab => [
                            ...currentTab, {
                                id_card: this.userID, id_section: tab.id_section,
                                header: tab.header,
                                sub_header: tab.sub_header,
                                tab_biography: tab.tab_biography,
                                background_photo: development ? `http://localhost:8000/${tab.background_photo}` : `${window.location.origin}/${c.background_photo}`,
                                // background_photo: c.background_photo,
                            }
                        ])

                    }
                })
                let newTabs = this.tabs().map(tab => {
                    let background_photo:string;
                    if(typeof tab.background_photo === 'string' && tab.background_photo.startsWith('/')){
                        do {
                            background_photo = tab.background_photo.slice(1)
                        }
                        while (typeof tab.background_photo === 'string' && tab.background_photo.startsWith('/'))
                        tab.background_photo = background_photo
                    }
                    return tab
                })
                this.tabs.set(newTabs)
                this.cardTabSectionTracker = Math.max(...this.tabs().map(t => t.id_section ?? 0));
            }

        })
    }
    activeSection = signal<SettingsSection>('profile'); // signals are like the useState() hook in react

    profile = signal<UserProfile>({
        age: 0, amount_tabs: 0, id: 0, interests: [], is_new: false, tabs: [],
        name: '',
        surnames: '',
        date_of_birth: '',
        gender: '',
        height: 0,
        school_name: '',
        profile_pic: 'assets/Images/userIcon.svg',
        studies:[]
    });

    tabs = signal<CardTab[]>([
        { id_card: this.userID ,id_section: 1, header: '', sub_header: '', tab_biography: '', background_photo: "" },
    ]);

    photoSlots = signal<(string | null)[]>(Array(6).fill(null));

    preferences = signal<UserPreferences>({
        maxDistanceKm: 50,
        minAge: 18,
        maxAge: 35,
        goals: [],
        showProfile: true,
        showDistance: true,
        showAge: false,
    });

    newPassword = '';
    confirmPassword = '';
    toastMessage = '';
    toastVisible = false;

    availableGoals = ['Friendship', 'Casual dating', 'Serious relationship', 'Study partner'];

    navItems: { id: SettingsSection; label: string; icon: string }[] = [
        {
            id: 'profile',
            label: 'Profile',
            icon: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
        },
        {
            id: 'card',
            label: 'Card tabs',
            icon: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>`,
        },/*
        {
            id: 'photos',
            label: 'Photos',
            icon: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
        },
        */
    ];
    logout(){
        this.userAPI.logoutJWT();
        this.router.navigate(['']);
    }
    goToHome(){
        this.router.navigateByUrl("/home");
    }
    setSection(section: SettingsSection): void {
        this.activeSection.set(section);
    }

    onAvatarChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.profile.update((p) => ({ ...p, profile_pic: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    }

    updateProfile(field: keyof UserProfile, value: string): void {
        this.profile.update((p) => ({ ...p, [field]: value }));
    }

    addTab(): void {
        this.tabs.update((tabs) => [
            ...tabs,
            {id_card: this.userID, id_section: ++this.cardTabSectionTracker,header: 'Default header', sub_header: 'Default subheader', tab_biography: 'your tab biography goes here', background_photo: "" },
        ]);
    }

    removeTab(id: number): void {
        if(id > 1){
            this.cardTabSectionTracker--;
            this.tabs.update((tabs) => tabs.filter((t) => {
                console.log(this.cardTabSectionTracker);
                return t.id_section !== id
            }));
        }

    }

    updateTab(id: number, field: keyof CardTab, value: string): void {
        this.tabs.update((tabs) =>
            tabs.map((t) => (t.id_section === id ? { ...t, [field]: value } : t))
        );
    }
/*
    onTabBgChange(event: Event, id: number): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.tabs.update((tabs) =>
                tabs.map((t) =>
                    t.id_section === id ? { ...t, background_photo: e.target?.result as string } : t
                )
            );
        };
        reader.readAsDataURL(file);
    }

 */
    /*
    onTabBgChange(event: Event, id: number): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        this.tabs.update(tabs =>
            tabs.map(t => t.id_section === id ? { ...t, background_photo: file } : t)
        );
    }

     */

    onTabBgChange(event: Event, id: number): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.tabs.update(tabs =>
                tabs.map(t => t.id_section === id
                    ? { ...t, background_photo: e.target?.result as string }
                    : t
                )
            );
        };
        reader.readAsDataURL(file); // converts to base64, helper handles the rest
    }
    getTabBgPreview(photo: string | File): string {
        if (photo instanceof File) return URL.createObjectURL(photo);
        // development ? `http://localhost:8000/${tab.background_photo}` : `${window.location.origin}${c.background_photo}
        return photo;

        // return development ? `http://localhost:8000/${photo}` : photo;
    }

    onPhotoChange(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.photoSlots.update((slots) => {
                const updated = [...slots];
                updated[index] = e.target?.result as string;
                return updated;
            });
        };
        reader.readAsDataURL(file);
    }




    getInitials(): string {
        const p = this.profile();
        const n = p.name?.charAt(0) ?? '';
        const s = p.surnames?.charAt(0) ?? '';
        return (n + s).toUpperCase() || 'YO';
    }
    preparePayload(): { profile: Partial<UserProfile>; tabs: CardTab[]; newPassword?: string } | null {
        const p = this.profile();
        const t = this.tabs();

        // Validate password if filled in
        if (this.newPassword || this.confirmPassword) {
            if (this.newPassword !== this.confirmPassword) {
                this.toastMessage = 'Passwords do not match';
                this.toastVisible = true;
                setTimeout(() => (this.toastVisible = false), 2500);
                return null;
            }
            if (this.newPassword.length < 8) {
                this.toastMessage = 'Password must be at least 8 characters';
                this.toastVisible = true;
                setTimeout(() => (this.toastVisible = false), 2500);
                return null;
            }
        }

        const profilePayload: Partial<UserProfile> = {
            name: p.name?.trim(),
            surnames: p.surnames?.trim(),
            date_of_birth: p.date_of_birth,
            gender: p.gender,
            height: p.height,
            school_name: p.school_name?.trim(),
            // Only include profile_pic if it's a new base64 upload (not an existing URL)
            ...(p.profile_pic?.startsWith('data:') && { profile_pic: p.profile_pic }),
        };

        // Strip base64 background photos back to just the string;
        // the server decides what to do with them
        const tabsPayload: CardTab[] = t.map(tab => {
            let background_photo: string;

            if(typeof tab.background_photo === 'string' && tab.background_photo.startsWith('/')){
                do {
                    background_photo = tab.background_photo.slice(1)
                    console.log(background_photo)
                }
                while (typeof tab.background_photo === 'string' && tab.background_photo.startsWith('/'))

            } else if (typeof tab.background_photo === 'string' && tab.background_photo.startsWith('data:')) {
                // New base64 upload - send as-is
                background_photo = tab.background_photo;
            } else if (typeof tab.background_photo === 'string' && tab.background_photo.trim() !== '') {
                // Existing server path - strip the origin prefix before sending
                if(development){
                    background_photo = tab.background_photo
                        .replace(`http://localhost:8000`, '')
                        .replace(window.location.origin, '')
                        .replace(/^\/+/, '');
                } else {
                    background_photo = tab.background_photo
                        .replace(`${window.location.origin}`, '')
                        .replace(window.location.origin, '')
                        .replace(/^\/+/, '');  
                }

            } else {
                // Genuinely empty
                background_photo = ' ';
            }

            return {
                id_card: tab.id_card,
                id_section: tab.id_section,
                header: tab.header?.trim(),
                sub_header: tab.sub_header?.trim(),
                tab_biography: tab.tab_biography?.trim(),
                background_photo
            };
        });
        /*
        const tabsPayload: CardTab[] = t.map(tab => ({
            id_card: tab.id_card,
            id_section: tab.id_section,
            header: tab.header?.trim(),
            sub_header: tab.sub_header?.trim(),
            tab_biography: tab.tab_biography?.trim(),
            // Only send background_photo if it's a new upload
            background_photo: tab.background_photo instanceof File ||
        (typeof tab.background_photo === 'string' && tab.background_photo.startsWith('data:'))
            ? tab.background_photo
            : (typeof tab.background_photo === 'string' && tab.background_photo.trim() !== '')
                ? tab.background_photo  // existing server path, pass it through
                : " "                   // genuinely empty
        }));

         */

        const payload: { profile: Partial<UserProfile>; tabs: CardTab[]; newPassword?: string } = {
            profile: profilePayload,
            tabs: tabsPayload,
        };

        if (this.newPassword) {
            payload.newPassword = this.newPassword;
        }

        return payload;
    }

    saveChanges(): void {
        const payload = this.preparePayload();
        if (!payload) return; // validation failed, toast already shown

        // Example call - replace with your actual endpoint and service method:
        this.userAPI.updateUserProfile(payload).subscribe({
           next: (res) => {
             this.toastMessage = 'Changes saved';
             this.toastVisible = true;
             setTimeout(() => (this.toastVisible = false), 2500);
             this.newPassword = '';
             this.confirmPassword = '';
             console.log(res)
           },
           error: () => {
             this.toastMessage = 'Save failed, please try again';
             this.toastVisible = true;
             setTimeout(() => (this.toastVisible = false), 2500);
           }
        });


        // Temporary until your endpoint is ready:
        /*
        console.log('Payload to send:', payload);
        this.toastMessage = 'Changes saved';
        this.toastVisible = true;
        setTimeout(() => (this.toastVisible = false), 2500);
        this.newPassword = '';
        this.confirmPassword = '';

         */
    }
}
