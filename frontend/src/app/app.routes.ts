import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Events } from './pages/events/events';
import { EventDetail } from './pages/event-detail/event-detail';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'login', //Adres /login olduğunda Login componentini göster.
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'events',
    component: Events
  },
  {
    path: 'events/:id',
    component: EventDetail
  },
  {
    path: 'admin',
    component: Admin
  }
];