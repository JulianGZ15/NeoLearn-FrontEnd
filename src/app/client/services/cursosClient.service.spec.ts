import { TestBed } from '@angular/core/testing';

import { CursosClientService } from './cursosClient.service';

describe('CursosService', () => {
  let service: CursosClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CursosClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
