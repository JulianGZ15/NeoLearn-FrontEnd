import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionesResultComponent } from './evaluaciones-result-component.component';

describe('EvaluacionesResultComponent', () => {
  let component: EvaluacionesResultComponent;
  let fixture: ComponentFixture<EvaluacionesResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionesResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluacionesResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
