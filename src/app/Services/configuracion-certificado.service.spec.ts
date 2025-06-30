import { TestBed } from '@angular/core/testing';

import { ConfiguracionCertificadoService } from './configuracion-certificado.service';

describe('ConfiguracionCertificadoService', () => {
  let service: ConfiguracionCertificadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionCertificadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
