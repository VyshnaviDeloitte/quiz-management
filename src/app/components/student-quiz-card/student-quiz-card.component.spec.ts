import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizCardComponent } from './student-quiz-card.component';

describe('StudentQuizCardComponent', () => {
  let component: StudentQuizCardComponent;
  let fixture: ComponentFixture<StudentQuizCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentQuizCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentQuizCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
