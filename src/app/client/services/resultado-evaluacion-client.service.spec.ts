import { TestBed } from '@angular/core/testing';

import { ResultadoEvaluacionClientService } from './resultado-evaluacion-client.service';

describe('ResultadoEvaluacionClientService', () => {
  let service: ResultadoEvaluacionClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResultadoEvaluacionClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
