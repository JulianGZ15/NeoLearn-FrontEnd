import { TestBed } from '@angular/core/testing';

import { RespuestasEvaluacionClientService } from './respuestas-evaluacion-client.service';

describe('RespuestasEvaluacionClientService', () => {
  let service: RespuestasEvaluacionClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RespuestasEvaluacionClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
