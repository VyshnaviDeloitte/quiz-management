import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCompletedComponent } from './student-completed.component';

describe('StudentCompletedComponent', () => {
  let component: StudentCompletedComponent;
  let fixture: ComponentFixture<StudentCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCompletedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
