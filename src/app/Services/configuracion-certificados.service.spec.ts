import { TestBed } from '@angular/core/testing';

import { ConfiguracionCertificadosService } from './configuracion-certificados.service';

describe('ConfiguracionCertificadosService', () => {
  let service: ConfiguracionCertificadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionCertificadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
