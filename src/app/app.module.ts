import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSnackBarModule} from "@angular/material/snack-bar";
// components
import {LoginComponent} from './components/login/login.component';
import {AdminPanelComponent} from './components/admin-panel/admin-panel.component';
import {SendMessageComponent} from './components/send-message/send-message.component';
import {UserFormComponent} from "./components/user-form/user-form.component";
import {MessageBoxComponent} from './components/message-box/message-box.component';
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {AccessLogsComponent} from "./components/access-logs/access-logs.component";
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminPanelComponent,
    SendMessageComponent,
    UserFormComponent,
    MessageBoxComponent,
    AccessLogsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeahead,
    MatSnackBarModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
