import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaseEnVivoComponent } from './clase-en-vivo.component';

describe('ClaseEnVivoComponent', () => {
  let component: ClaseEnVivoComponent;
  let fixture: ComponentFixture<ClaseEnVivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaseEnVivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaseEnVivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
