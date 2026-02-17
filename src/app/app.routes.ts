import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  { path: 'snake', loadComponent: () => import('./features/snake/snake.component').then((m) => m.SnakeComponent) },
  { path: 'tetris', loadComponent: () => import('./features/tetris/tetris.component').then((m) => m.TetrisComponent) },
  { path: 'breakout', loadComponent: () => import('./features/breakout/breakout.component').then((m) => m.BreakoutComponent) },
  { path: 'invaders', loadComponent: () => import('./features/invaders/invaders.component').then((m) => m.InvadersComponent) },
  { path: '2048', loadComponent: () => import('./features/puzzle-2048/puzzle-2048.component').then((m) => m.Puzzle2048Component) },
  { path: 'memory', loadComponent: () => import('./features/memory/memory.component').then((m) => m.MemoryComponent) },
  { path: 'stats', loadComponent: () => import('./features/stats/stats.component').then((m) => m.StatsComponent) },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
