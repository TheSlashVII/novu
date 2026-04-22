import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPostAcceptRequest } from './admin-post-accept-request';

describe('PostRegisterComponent', () => {
  let component: AdminPostAcceptRequest;
  let fixture: ComponentFixture<AdminPostAcceptRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPostAcceptRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPostAcceptRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
