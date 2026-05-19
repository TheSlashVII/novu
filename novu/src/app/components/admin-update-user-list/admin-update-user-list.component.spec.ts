import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdateUserListComponent } from './admin-update-user-list.component';

describe('AdminUpdateUserListComponent', () => {
  let component: AdminUpdateUserListComponent;
  let fixture: ComponentFixture<AdminUpdateUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUpdateUserListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUpdateUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
