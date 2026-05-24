import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikedPanelComponent } from './liked-panel.component';

describe('LikedPanelComponent', () => {
  let component: LikedPanelComponent;
  let fixture: ComponentFixture<LikedPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikedPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LikedPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
