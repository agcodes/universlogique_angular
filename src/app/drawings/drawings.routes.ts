import { Routes } from '@angular/router';
import { MoonDrawingComponent } from './moon-drawing/moon-drawing.component';

export const DRAWINGS_ROUTES: Routes = [
  { path: '', redirectTo: 'moon', pathMatch: 'full' },
  { path: 'moon', component: MoonDrawingComponent },
];
