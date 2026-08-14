import { Routes } from '@angular/router';
import { Main } from './templates/main/main';
import { Auth } from './templates/auth/auth';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';

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
  }
];
