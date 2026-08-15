import { Routes } from '@angular/router';
import { Main } from './templates/main/main';
import { Auth } from './templates/auth/auth';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { App } from './templates/app/app';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Main,
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: Auth,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'signup', component: Signup }
    ]
  },
  {
    path: 'app',
    component: App,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart) },
      { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout) },
      { path: 'confirmation', loadComponent: () => import('./pages/confirmation/confirmation').then((m) => m.Confirmation) }
    ]
  }
];
