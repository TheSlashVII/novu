import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegisterRequestListComponent } from './admin-register-request-list.component';

describe('AdminRegisterRequestListComponent', () => {
  let component: AdminRegisterRequestListComponent;
  let fixture: ComponentFixture<AdminRegisterRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRegisterRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRegisterRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
