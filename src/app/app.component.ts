import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {ApiService} from "./service/api.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAdmin: boolean = false;
  isAuthenticated: boolean = false;
  currentRoute: string = '';
  title: string = 'mean-stack-crud-app';

  constructor(private router: Router, private apiService: ApiService) {
    // Listen to route changes to update the current route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }

  ngOnInit() {
    this.apiService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    this.apiService.isAuthenticated().subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  isLoginRoute(): boolean {
    return this.currentRoute === '/login';
  }

  logOut(): void {
    this.apiService.logout().subscribe(
      () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Error logging out', error);
      }
    );
  }

}
