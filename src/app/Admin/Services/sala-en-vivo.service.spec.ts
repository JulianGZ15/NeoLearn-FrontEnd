import { TestBed } from '@angular/core/testing';

import { SalaEnVivoService } from './sala-en-vivo.service';

describe('SalaEnVivoService', () => {
  let service: SalaEnVivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalaEnVivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
