import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntasCursoComponent } from './preguntas-curso.component';

describe('PreguntasCursoComponent', () => {
  let component: PreguntasCursoComponent;
  let fixture: ComponentFixture<PreguntasCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreguntasCursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreguntasCursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
