import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionesTakeComponent } from './evaluaciones-take-component.component';

describe('EvaluacionesTakeComponent', () => {
  let component: EvaluacionesTakeComponent;
  let fixture: ComponentFixture<EvaluacionesTakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionesTakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluacionesTakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
