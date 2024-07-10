import {Component} from '@angular/core';
import {ApiService} from '../../service/api.service';
import {Message} from '../../model/message';
import {Router} from '@angular/router';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent {
  message: Message = {
    senderUsername: '',
    receiverUsername: '',
    timestamp: new Date(),
    title: '',
    content: ''
  };
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  sendMessage() {
    const token = localStorage.getItem('token');
    if (token) {
      const user = this.parseJwt(token);
      if (user && user.username) {
        this.message.senderUsername = user.username;

        // Send the message via the ApiService
        this.apiService.sendMessage(this.message).subscribe(
          () => {
            this.router.navigate(['/messages']);
          },
          error => {
            console.error('Error sending message', error);
          }
        );
      } else {
        console.error('Invalid user data from token');
        this.router.navigate(['/login']);
      }
    } else {
      console.error('No token found, redirecting to login');
      this.router.navigate(['/login']);
    }
  }

  parseJwt(token: string): any {
    try {
      return jwtDecode( token);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }
}
