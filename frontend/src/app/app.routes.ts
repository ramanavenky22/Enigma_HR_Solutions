import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { TeamComponent } from './components/team/team.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { autoRedirectGuard } from './guards/auto-redirect.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [autoRedirectGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile/:auth0_id/edit', component: EmployeeFormComponent, canActivate: [AuthGuard] },
  { path: 'team', component: TeamComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { 
    path: 'employees',
    canActivate: [AuthGuard],
    children: [
      { path: 'new', component: EmployeeFormComponent },
      { path: ':id', component: ProfileComponent },
      { path: ':id/edit', component: EmployeeFormComponent }
    ]
  },
];
