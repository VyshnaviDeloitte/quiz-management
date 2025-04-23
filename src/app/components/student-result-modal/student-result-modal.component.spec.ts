import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentResultModalComponent } from './student-result-modal.component';

describe('StudentResultModalComponent', () => {
  let component: StudentResultModalComponent;
  let fixture: ComponentFixture<StudentResultModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentResultModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentResultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
