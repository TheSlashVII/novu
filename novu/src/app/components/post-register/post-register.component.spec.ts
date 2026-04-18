import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostRegisterComponent } from './post-register.component';

describe('PostRegisterComponent', () => {
  let component: PostRegisterComponent;
  let fixture: ComponentFixture<PostRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
