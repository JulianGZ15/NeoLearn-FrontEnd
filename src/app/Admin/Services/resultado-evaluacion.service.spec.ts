import { TestBed } from '@angular/core/testing';

import { ResultadoEvaluacionService } from './resultado-evaluacion.service';

describe('ResultadoEvaluacionService', () => {
  let service: ResultadoEvaluacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResultadoEvaluacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
