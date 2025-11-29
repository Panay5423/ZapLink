import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPassworComponent } from './reset-passwor.component';

describe('ResetPassworComponent', () => {
  let component: ResetPassworComponent;
  let fixture: ComponentFixture<ResetPassworComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPassworComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPassworComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
