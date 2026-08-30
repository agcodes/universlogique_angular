import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'drawings',
    loadChildren: () => import('./drawings/drawings.routes').then((m) => m.DRAWINGS_ROUTES),
  },
];
