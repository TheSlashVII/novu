import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationPreferencesComponent } from './relation-preferences.component';

describe('RelationPreferencesComponent', () => {
  let component: RelationPreferencesComponent;
  let fixture: ComponentFixture<RelationPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationPreferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
