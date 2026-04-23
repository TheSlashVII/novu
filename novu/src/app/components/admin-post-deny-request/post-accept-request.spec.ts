import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPostDenyRequestComponent } from './admin-post-deny-request.component';

describe('PostRegisterComponent', () => {
  let component: AdminPostDenyRequestComponent;
  let fixture: ComponentFixture<AdminPostDenyRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPostDenyRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPostDenyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
