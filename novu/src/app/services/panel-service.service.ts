import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable} from '@angular/core';
import {baseServerURL} from '../baseURLconfig';
import { UserAPIService } from './user-api.service';
export interface StudentFilters{
  ageMin: number;
  ageMax: number;
  interests: string[];
  studies: string[];
}


@Injectable({
  providedIn: 'root'
})

export class PanelServiceService {

  isOpen = false;
  onApply: (() => void) | null = null;

  filters: StudentFilters = {
    ageMin:18,
    ageMax:30,
    interests: [],
    studies: []
  };

  allInterests: string[] = [];
  isLoadingInterests = false;
  interestSearch = '';
  allStudies: string[]  = [];
  isLoadingStudies      = false;
  studySearch           = '';


  constructor(private http: HttpClient, private userAPI: UserAPIService) { }

  //Panel
  public open(): void {
  this.isOpen = true;
  console.log('abriendo panel, allInterests:', this.allInterests.length, 'allStudies:', this.allStudies.length);
  if (this.allInterests.length === 0) {
    this.loadingInterests();
  }
  if (this.allStudies.length === 0) {
    this.loadStudies();
  }
}

  public close(): void {
  this.isOpen = false;
  if (this.onApply) this.onApply();
}
    private authHeaders(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({ "Authorization": "Bearer " + this.userAPI.getToken() })
        };
    }

  //Intereses
  public loadingInterests(): void{
    this.isLoadingInterests = true;
    this.http.get<{name:string}[]>(`${baseServerURL}/interests/all/`, this.authHeaders()).subscribe({
      next: (data) => {
          //@ts-ignore
        const unique = [...new Set(data.map(i => i.name))].sort();
        this.allInterests = unique;
        this.isLoadingInterests = false;
      },
      error: () =>{
        this.isLoadingInterests = false;
      }
    })
  }

  //Helpers
  getFilteredInterests(): string[]{
    const q = this.interestSearch.toLowerCase().trim();
    if (!q) return this.allInterests;
    return this.allInterests.filter(i => i.toLowerCase().includes(q))
  }

  toggleInterest(interest: string):void{
    const idx = this.filters.interests.indexOf(interest);
    if(idx === -1){
      this.filters.interests.push(interest);
    }else{
      this.filters.interests.splice(idx,1)
    }
  }

  isInterestSelected(interest: string): boolean{
    return this.filters.interests.includes(interest);
  }

  setAgeMin(value: number): void{
    const v = Number(value);
    this.filters.ageMin = v >= this.filters.ageMax ? this.filters.ageMax - 1: Math.max(16,v);
  }

  setAgeMax(value: number): void{
    const v = Number(value);
    this.filters.ageMax = v <= this.filters.ageMin ? this.filters.ageMin + 1 : Math.min(60,v)
  }

  activeFiltersCount(): number{
    let count = 0;
    if(this.filters.ageMin !== 18 || this.filters.ageMax !== 30) count++;
    count += this.filters.interests.length;
    return count;
  }

  resetFilters(): void{
    this.filters = {ageMin: 18, ageMax:30, interests: [], studies: []};
    this.interestSearch = '';
    this.studySearch = '';
  }

  getFilteredStudies(): string[]{
    const q = this.studySearch.toLowerCase().trim();
    if (!q) return this.allStudies;
    return this.allStudies.filter(s => s.toLowerCase().includes(q))
  }

  loadStudies(): void {
  this.isLoadingStudies = true;
  console.log('llamando a studies/all/...');
  this.http.get<{name: string}[]>(`${baseServerURL}/studies/all/`).subscribe({
    next: (data) => {
      console.log('estudios recibidos:', data);
      this.allStudies = data.map(s => s.name).sort();
      this.isLoadingStudies = false;
    },
    error: (err) => {
      console.log('error cargando estudios:', err);
      this.isLoadingStudies = false;
    }
  });
}

  toggleStudy(study: string): void{
    const idx = this.filters.studies.indexOf(study);
    if(idx === -1){
      this.filters.studies.push(study);
    }else{
      this.filters.studies.splice(idx,1);
    }
  }

  isStudySelected(study: string): boolean{
    return this.filters.studies.includes(study);
  }

 prepareFiltersBeforeApply(): void {
  console.log('interestSearch:', this.interestSearch);
  console.log('studySearch:', this.studySearch);
  console.log('allInterests:', this.allInterests);
  console.log('allStudies:', this.allStudies);

  if (this.interestSearch.trim() !== '') {
    const regex = new RegExp(this.interestSearch.trim(), 'i');
    const matches = this.allInterests.filter(i => regex.test(i));
    console.log('matches intereses:', matches);
    matches.forEach(m => {
      if (!this.filters.interests.includes(m)) {
        this.filters.interests.push(m);
      }
    });
  }

  if (this.studySearch.trim() !== '') {
    const regex = new RegExp(this.studySearch.trim(), 'i');
    const matches = this.allStudies.filter(s => regex.test(s));
    console.log('matches estudios:', matches);
    matches.forEach(m => {
      if (!this.filters.studies.includes(m)) {
        this.filters.studies.push(m);
      }
    });
  }
}

}
