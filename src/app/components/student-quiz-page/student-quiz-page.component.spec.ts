import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizPageComponent } from './student-quiz-page.component';

describe('StudentQuizPageComponent', () => {
  let component: StudentQuizPageComponent;
  let fixture: ComponentFixture<StudentQuizPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentQuizPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentQuizPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
