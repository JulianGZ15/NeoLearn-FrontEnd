import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntasClientComponent } from './preguntas-client.component';

describe('PreguntasClientComponent', () => {
  let component: PreguntasClientComponent;
  let fixture: ComponentFixture<PreguntasClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreguntasClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreguntasClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
