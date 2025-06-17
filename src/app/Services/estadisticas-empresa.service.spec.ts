import { TestBed } from '@angular/core/testing';

import { EstadisticasEmpresaService } from './estadisticas-empresa.service';

describe('EstadisticasEmpresaService', () => {
  let service: EstadisticasEmpresaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadisticasEmpresaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
