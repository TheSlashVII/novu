import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeleteAccountModalServiceService {

    constructor() { }
    isOpen: boolean = false;

    open()  { this.isOpen = true;  }
    close() { this.isOpen = false; }
    toggle() { this.isOpen = !this.isOpen; }
}
