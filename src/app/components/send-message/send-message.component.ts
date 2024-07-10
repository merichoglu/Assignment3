import {Component} from '@angular/core';
import {ApiService} from '../../service/api.service';
import {Message} from '../../model/message';
import {Router} from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import {map, Observable} from "rxjs";
import {NgbTypeaheadSelectItemEvent} from "@ng-bootstrap/ng-bootstrap";

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
  userList: string[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserList();
  }

  loadUserList(): void {
    this.apiService.getAllUsersForTypeAhead().subscribe((users: any[]) => {
      this.userList = users.map(user => user.username);
    }, error => {
      this.errorMessage = 'Error loading user list';
    });
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      map(term => term.length < 2 ? []
        : this.userList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

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

  onSelect(event: NgbTypeaheadSelectItemEvent): void {
    this.message.receiverUsername = event.item;
  }
}
