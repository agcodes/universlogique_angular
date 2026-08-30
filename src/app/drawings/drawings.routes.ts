import { Routes } from '@angular/router';
import { MoonDrawing } from './moon-drawing/moon-drawing';

export const DRAWINGS_ROUTES: Routes = [
  { path: '', redirectTo: 'moon', pathMatch: 'full' },
  { path: 'moon', component: MoonDrawing },
];
