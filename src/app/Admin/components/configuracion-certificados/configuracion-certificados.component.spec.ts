import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionCertificadosComponent } from './configuracion-certificados.component';

describe('ConfiguracionCertificadosComponent', () => {
  let component: ConfiguracionCertificadosComponent;
  let fixture: ComponentFixture<ConfiguracionCertificadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionCertificadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionCertificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
