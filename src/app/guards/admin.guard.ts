import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {ApiService} from 'src/app/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private apiService: ApiService) {
  }

  canActivate(): boolean {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      return true;
    } else {
      this.apiService.logout().subscribe(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        this.router.navigate(['/login']);
      }, error => {
        console.error(error);
        this.router.navigate(['/login']);
      });
      return false;
    }
  }
}
