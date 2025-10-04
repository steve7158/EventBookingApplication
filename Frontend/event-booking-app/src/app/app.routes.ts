import { Routes } from '@angular/router';
import { CalendarViewComponent } from './components/calendar-view/calendar-view.component';
import { UserPreferencesComponent } from './components/user-preferences/user-preferences.component';
import { AdminViewComponent } from './components/admin-view/admin-view.component';

export const routes: Routes = [
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: 'calendar', component: CalendarViewComponent },
  { path: 'preferences', component: UserPreferencesComponent },
  { path: 'admin', component: AdminViewComponent },
  { path: '**', redirectTo: '/calendar' }
];
