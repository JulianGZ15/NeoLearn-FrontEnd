import { TestBed } from '@angular/core/testing';

import { EvaluacionesClientService } from './evaluaciones-client.service';

describe('EvaluacionesClientService', () => {
  let service: EvaluacionesClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluacionesClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
