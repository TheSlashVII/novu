import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegisterRequestDetailComponent } from './admin-register-request-detail.component';

describe('AdminRegisterRequestDetailComponent', () => {
  let component: AdminRegisterRequestDetailComponent;
  let fixture: ComponentFixture<AdminRegisterRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRegisterRequestDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRegisterRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
