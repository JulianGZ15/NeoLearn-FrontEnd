import { TestBed } from '@angular/core/testing';

import { ClasesClientService } from './clases-client.service';

describe('ClasesClientService', () => {
  let service: ClasesClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClasesClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
