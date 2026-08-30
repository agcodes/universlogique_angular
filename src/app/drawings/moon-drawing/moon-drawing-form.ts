import { Component, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'moon-drawing-form',
  standalone: true,
  templateUrl: './moon-drawing-form.html',
})
export class MoonDrawingForm {
  indice = 0;
  triggerCanvas = false;

  handleCanvasAction(event: any) {
    console.log('Action reçue du canvas:', event);
    // Traite les actions émises par le composant canvas-drawing
  }
}
