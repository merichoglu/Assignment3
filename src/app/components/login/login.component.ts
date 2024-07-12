import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string;
  password: string;
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {
  }

  login() {
    this.apiService.login(this.username, this.password).subscribe(
      res => {
        localStorage.setItem('token', res.token);
        const user = this.parseJwt(res.token);
        if (user.isAdmin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/messages']);
        }
      },
      err => {
        this.errorMessage = 'Invalid username or password';
      }
    );
  }

  parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  }
}
