import { TestBed } from '@angular/core/testing';

import { ClaseEnVivoService } from './clase-en-vivo.service';

describe('ClaseEnVivoService', () => {
  let service: ClaseEnVivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaseEnVivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
