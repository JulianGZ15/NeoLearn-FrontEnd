import { TestBed } from '@angular/core/testing';

import { RespuestasEvaluacionService } from './respuestas-evaluacion.service';

describe('RespuestasEvaluacionService', () => {
  let service: RespuestasEvaluacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RespuestasEvaluacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
