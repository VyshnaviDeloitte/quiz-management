import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredStudentListComponent } from './registered-student-list.component';

describe('RegisteredStudentListComponent', () => {
  let component: RegisteredStudentListComponent;
  let fixture: ComponentFixture<RegisteredStudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisteredStudentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisteredStudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
