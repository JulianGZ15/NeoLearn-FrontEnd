import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionesClientComponent } from './evaluaciones-client.component';

describe('EvaluacionesClientComponent', () => {
  let component: EvaluacionesClientComponent;
  let fixture: ComponentFixture<EvaluacionesClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionesClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluacionesClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
