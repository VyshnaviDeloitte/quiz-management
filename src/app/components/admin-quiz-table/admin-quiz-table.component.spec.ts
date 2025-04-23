import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuizTableComponent } from './admin-quiz-table.component';

describe('AdminQuizTableComponent', () => {
  let component: AdminQuizTableComponent;
  let fixture: ComponentFixture<AdminQuizTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminQuizTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminQuizTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
