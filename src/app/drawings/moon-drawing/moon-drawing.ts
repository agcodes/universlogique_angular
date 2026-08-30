import { Component } from '@angular/core';
import { MoonDrawingComponent } from './moon-drawing.component';
import { MoonDrawingForm } from './moon-drawing-form';

@Component({
  selector: 'app-moon-drawing',
  standalone: true, // Assure-toi que ce composant est aussi standalone
  imports: [MoonDrawingComponent, MoonDrawingForm], // Importe le composant standalone
  templateUrl: './moon-drawing.html',
})
export class MoonDrawing {}
