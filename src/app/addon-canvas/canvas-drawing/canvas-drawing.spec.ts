import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasDrawing } from './canvas-drawing';

describe('CanvasDrawing', () => {
  let component: CanvasDrawing;
  let fixture: ComponentFixture<CanvasDrawing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasDrawing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasDrawing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
