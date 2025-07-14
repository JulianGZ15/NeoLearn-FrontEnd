import { TestBed } from '@angular/core/testing';

import { PreguntasEvaluacionClientService } from './preguntas-evaluacion-client.service';

describe('PreguntasEvaluacionClientService', () => {
  let service: PreguntasEvaluacionClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreguntasEvaluacionClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
