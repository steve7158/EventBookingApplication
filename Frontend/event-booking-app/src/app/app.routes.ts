import { Routes } from '@angular/router';
import { CalendarViewComponent } from './components/calendar-view/calendar-view.component';
import { UserPreferencesComponent } from './components/user-preferences/user-preferences.component';
import { AdminViewComponent } from './components/admin-view/admin-view.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard, loginGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [loginGuard] },
  { path: 'calendar', component: CalendarViewComponent, canActivate: [authGuard] },
  // { path: 'preferences', component: UserPreferencesComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminViewComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '/login' }
];
