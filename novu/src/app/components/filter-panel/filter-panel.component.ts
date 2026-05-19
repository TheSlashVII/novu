import { Component } from '@angular/core';
import { PanelServiceService } from '../../services/panel-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css'
})

export class FilterPanelComponent {

  

  constructor(public filterPanel: PanelServiceService){}

  applyFilters(): void{
    this.filterPanel.close();
  }

  resetFilters(): void{
    this.filterPanel.resetFilters();
  }

  close(): void{
    this.filterPanel.close();
  }
}
