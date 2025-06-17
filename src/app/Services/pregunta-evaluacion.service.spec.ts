import { TestBed } from '@angular/core/testing';

import { PreguntaEvaluacionService } from './pregunta-evaluacion.service';

describe('PreguntaEvaluacionService', () => {
  let service: PreguntaEvaluacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreguntaEvaluacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
