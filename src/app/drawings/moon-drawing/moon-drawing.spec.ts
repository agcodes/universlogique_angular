import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoonDrawing } from './moon-drawing';

describe('MoonDrawing', () => {
  let component: MoonDrawing;
  let fixture: ComponentFixture<MoonDrawing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoonDrawing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoonDrawing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
