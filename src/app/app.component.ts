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
  title: string = 'Assignment 3';

  constructor(private router: Router, private apiService: ApiService) {
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
        console.error(error);
      }
    );
  }

}
