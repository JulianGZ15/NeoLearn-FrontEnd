import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosClientComponent } from './cursos-client.component';

describe('CursosClientComponent', () => {
  let component: CursosClientComponent;
  let fixture: ComponentFixture<CursosClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursosClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursosClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
