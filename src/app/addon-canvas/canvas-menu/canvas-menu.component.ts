import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-canvas-menu',
  standalone: true,
  templateUrl: './canvas-menu.component.html',
  styleUrls: ['./canvas-menu.component.css'],
})
export class CanvasMenuComponent {
  @Input() canvasParams: any;
  @Output() actionToCanvas = new EventEmitter<any>();

  hideMenu() {
    this.actionToCanvas.emit({ actionName: 'hideMenu' });
  }
}
