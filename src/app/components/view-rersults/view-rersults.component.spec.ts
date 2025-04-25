import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRersultsComponent } from './view-rersults.component';

describe('ViewRersultsComponent', () => {
  let component: ViewRersultsComponent;
  let fixture: ComponentFixture<ViewRersultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRersultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRersultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
