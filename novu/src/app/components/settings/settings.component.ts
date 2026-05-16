import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {UserAPIService} from '../../services/user-api.service';
import {UserProfile} from '../home/home.component';
import {CardTab} from '../../services/card-tab.service';
import {development} from '../../baseURLconfig';

export type SettingsSection = 'profile' | 'card' | 'preferences';




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
                    profile_pic: result.profile_pic,
                    school_name: result.school_name,
                    surnames: result.surnames,
                    tabs: result.tabs,
                    age:result.age})
                let c = this.profile().tabs[0]
                this.tabs.set([{
                    id_card: this.userID, id_section: c.id_section,
                    header: c.header,
                    sub_header: c.sub_header,
                    tab_biography: c.tab_biography,
                    background_photo: development ? `http://localhost:8000${c.background_photo}` : `${window.location.origin}${c.background_photo}`,
                }])
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
        profile_pic: null
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
        {
            id: 'preferences',
            label: 'Preferences',
            icon: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"/><path d="M12 8v4l3 3"/></svg>`,
        },
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
        const id = Date.now();
        this.tabs.update((tabs) => [
            ...tabs,
            { id_card: this.userID, header: '', sub_header: '', tab_biography: '', background_photo: "" },
        ]);
    }

    removeTab(id: number): void {
        this.tabs.update((tabs) => tabs.filter((t) => t.id_section !== id));
    }

    updateTab(id: number, field: keyof CardTab, value: string): void {
        this.tabs.update((tabs) =>
            tabs.map((t) => (t.id_section === id ? { ...t, [field]: value } : t))
        );
    }

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

    updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
        this.preferences.update((p) => ({ ...p, [key]: value }));
    }

    toggleGoal(goal: string): void {
        this.preferences.update((p) => {
            const goals = p.goals.includes(goal)
                ? p.goals.filter((g) => g !== goal)
                : [...p.goals, goal];
            return { ...p, goals };
        });
    }

    isGoalSelected(goal: string): boolean {
        return this.preferences().goals.includes(goal);
    }

    saveChanges(): void {
        this.toastMessage = 'Changes saved';
        this.toastVisible = true;
        setTimeout(() => (this.toastVisible = false), 2500);
    }

    getInitials(): string {
        const p = this.profile();
        const n = p.name?.charAt(0) ?? '';
        const s = p.surnames?.charAt(0) ?? '';
        return (n + s).toUpperCase() || 'YO';
    }
}
