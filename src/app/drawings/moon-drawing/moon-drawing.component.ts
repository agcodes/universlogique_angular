import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CanvasDrawingComponent } from '@addon-canvas/canvas-drawing/canvas-drawing.component';

@Component({
  selector: 'moon-drawing-component',
  standalone: true,
  imports: [CanvasDrawingComponent],
  templateUrl: '../../addon-canvas/canvas-drawing/drawing.component.html',
})
export class MoonDrawingComponent {
  @ViewChild(CanvasDrawingComponent) canvasDrawing!: CanvasDrawingComponent;
  indice = 0;
  triggerCanvas = false;

  handleCanvasAction(event: any) {
    console.log('Action reçue du canvas:', event);
    // Traite les actions émises par le composant canvas-drawing
  }

  ngAfterViewInit() {
    this.canvasDrawing.addMainAnimation(() => this.draw(), 25);
    // Accède à CanvasMenuComponent via CanvasDrawingComponent
    setTimeout(() => {
      this.canvasDrawing.initCanvas(true, false);
      console.log(this.canvasDrawing.canvasService);
      this.canvasDrawing.startComponentAnimation();
    });
  }
  draw() {
    this.indice += 1;
    this.canvasDrawing.canvasService.drawService.drawBackground([this.indice, 50, 50]);
  }
}
