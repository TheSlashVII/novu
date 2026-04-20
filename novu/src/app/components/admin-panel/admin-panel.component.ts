import { Component } from '@angular/core';


@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
    standalone: true
})
export class AdminPanelComponent {
    /*
    * Amount of Pending register requests
    * */
    registerRequestsCount:number = 0;





}
