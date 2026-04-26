import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRestrictUserDetailComponent } from './admin-restrict-user-detail.component';

describe('AdminRestrictUserDetailComponent', () => {
  let component: AdminRestrictUserDetailComponent;
  let fixture: ComponentFixture<AdminRestrictUserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRestrictUserDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRestrictUserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
