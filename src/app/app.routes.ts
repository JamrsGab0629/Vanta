import { Routes } from '@angular/router';
import { Main } from './templates/main/main';
import { Auth } from './templates/auth/auth';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { App } from './templates/app/app';
import { Home } from './pages/home/home';
import { Admin } from './templates/admin/admin';
import { Product } from './pages/product/product';
import { authGuard, guestGuard, transactionGuard, adminGuard } from './core/verify-auth';
import { TransactLayoutComponent } from './templates/transact/transact-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: Main,
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: Auth,
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'signup', component: Signup }
    ]
  },
  {
    path: 'app',
    component: App,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart) },
      { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout) },
      { path: 'build-guides', loadComponent: () => import('./pages/build-guides/build-guides').then((m) => m.BuildGuide) },
      { 
        path: 'confirmation',
        canActivate: [transactionGuard],
        loadComponent: () => import('./pages/confirmation/confirmation').then((m) => m.Confirmation) 
      },
      {
        path: 'transact',
        component: TransactLayoutComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'processing' },
          { path: 'processing', loadComponent: () => import('./pages/transact/processing-transactions.component').then(m => m.ProcessingTransactionsComponent) },
          { path: 'in-transit', loadComponent: () => import('./pages/transact/delivering-transactions.component').then(m => m.DeliveringTransactionsComponent) },
          { path: 'history', loadComponent: () => import('./pages/transact/transaction-history.component').then(m => m.TransactionHistoryComponent) },
        ],
      }
    ]
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./pages/history/history').then((m) => m.History) },
      { path: 'database', loadComponent: () => import('./pages/database/database').then((m) => m.Database) },
      { path: 'product', component: Product },
      { path: 'users', loadComponent: () => import('./pages/users/users').then((m) => m.Users) },
    ]
  }
];