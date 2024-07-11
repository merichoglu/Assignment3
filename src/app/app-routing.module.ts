import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminPanelComponent} from './components/admin-panel/admin-panel.component';
import {MessageBoxComponent} from "./components/message-box/message-box.component";
import {SendMessageComponent} from './components/send-message/send-message.component';
import {LoginComponent} from './components/login/login.component';
import {UserFormComponent} from './components/user-form/user-form.component';
import {AuthGuard} from './guards/auth.guard';
import {AdminGuard} from './guards/admin.guard';
import {AccessLogsComponent} from "./components/access-logs/access-logs.component";

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'send', component: SendMessageComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessageBoxComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'add-user', component: UserFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'access-logs', component: AccessLogsComponent, canActivate: [AuthGuard, AdminGuard]},
  { path: 'edit-user/:username', component: UserFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
