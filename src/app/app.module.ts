import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// components
import {LoginComponent} from './components/login/login.component';
import {AdminPanelComponent} from './components/admin-panel/admin-panel.component';
import {SendMessageComponent} from './components/send-message/send-message.component';
import {UserFormComponent} from "./components/user-form/user-form.component";
import {MessageBoxComponent} from './components/message-box/message-box.component';
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminPanelComponent,
    SendMessageComponent,
    UserFormComponent,
    MessageBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeahead
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
