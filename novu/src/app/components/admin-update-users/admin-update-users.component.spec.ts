import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdateUsersComponent } from './admin-update-users.component';

describe('AdminUpdateUsersComponent', () => {
  let component: AdminUpdateUsersComponent;
  let fixture: ComponentFixture<AdminUpdateUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUpdateUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUpdateUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
