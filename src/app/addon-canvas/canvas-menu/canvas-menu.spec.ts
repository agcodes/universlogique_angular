import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasMenu } from './canvas-menu';

describe('CanvasMenu', () => {
  let component: CanvasMenu;
  let fixture: ComponentFixture<CanvasMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
