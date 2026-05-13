import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';

export interface StudentFilters{
  ageMin: number;
  ageMax: number;
  interests: string[];
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
    interests: []
  };

  allInterests: string[] = [];
  isLoadingInterests = false;
  interestSearch = '';

  constructor(private http: HttpClient) { }

  //Panel
  public open(): void{
    this.isOpen = true;
    if(this.allInterests.length === 0){
      this.loadingInterests();
    }
  }

  public close(): void{
    this.isOpen = false;
    if(this.onApply) this.onApply();
  }

  //Intereses
  public loadingInterests(): void{
    this.isLoadingInterests = true;
    this.http.get<{name:string}[]>('http://localhost:8000/api/users/interests/all/').subscribe({
      next: (data) => {
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
    this.filters = {ageMin: 18, ageMax:30, interests: []}
    this.interestSearch = '';
  }
}
