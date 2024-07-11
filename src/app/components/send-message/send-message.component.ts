import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {
  message: any = {
    senderUsername: '',
    receiverUsername: '',
    timestamp: new Date(),
    title: '',
    content: ''
  };
  errorMessage: string = '';
  userList: string[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserList();
  }

  loadUserList(): void {
    this.apiService.getTypeaheadUsers().subscribe({
      next: (users: any[]) => {
        if (Array.isArray(users)) {
          this.userList = users.map(user => user.username);
        } else {
          this.userList = [];
        }
      },
      error: (err) => {
        this.errorMessage = 'Error loading user list';
      }
    });
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      map(term => term.length < 1 ? []
        : this.userList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

  sendMessage() {
    if (!this.message.receiverUsername || !this.message.title || !this.message.content) {
      this.errorMessage = 'Receiver, title, and content cannot be empty';
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      const user = this.parseJwt(token);
      if (user && user.username) {
        this.message.senderUsername = user.username;

        this.apiService.sendMessage(this.message).subscribe(
          () => {
            this.router.navigate(['/messages']);
          },
          error => {
            if (error.status === 409) {
              this.errorMessage = 'Receiver not found'
            } else {
              this.errorMessage = 'Error sending message';
            }
          }
        );
      } else {
        this.errorMessage = 'Invalid user data from token';
        this.router.navigate(['/login']);
      }
    } else {
      this.errorMessage = 'No token found, redirecting to login';
      this.router.navigate(['/login']);
    }
  }

  parseJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  onSelect(event: any): void {
    this.message.receiverUsername = event.item;
  }
}
