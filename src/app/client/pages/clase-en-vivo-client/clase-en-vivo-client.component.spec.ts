import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaseEnVivoClientComponent } from './clase-en-vivo-client.component';

describe('ClaseEnVivoClientComponent', () => {
  let component: ClaseEnVivoClientComponent;
  let fixture: ComponentFixture<ClaseEnVivoClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaseEnVivoClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaseEnVivoClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
