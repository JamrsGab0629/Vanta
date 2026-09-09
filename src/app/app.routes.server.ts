import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 1. Render all protected child routes purely on client side
  {
    path: 'app/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  // 2. Public pages (landing, login, etc.) use server-side rendering
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];