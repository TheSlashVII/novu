import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRestrictUserComponent } from './admin-restrict-user.component';

describe('AdminRestrictUserComponent', () => {
  let component: AdminRestrictUserComponent;
  let fixture: ComponentFixture<AdminRestrictUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRestrictUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRestrictUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
