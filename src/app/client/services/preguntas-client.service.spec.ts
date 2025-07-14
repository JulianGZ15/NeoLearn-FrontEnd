import { TestBed } from '@angular/core/testing';

import { PreguntasClientService } from './preguntas-client.service';

describe('PreguntasClientService', () => {
  let service: PreguntasClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreguntasClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
