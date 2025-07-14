import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioClasesComponent } from './calendario-clases.component';

describe('CalendarioClasesComponent', () => {
  let component: CalendarioClasesComponent;
  let fixture: ComponentFixture<CalendarioClasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioClasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioClasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
