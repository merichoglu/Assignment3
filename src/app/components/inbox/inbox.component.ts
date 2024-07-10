import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { Message } from '../../model/message';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
  messages: Message[] = [];
  searchQuery: string = '';
  sortBy: string = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchMessages();
  }

  fetchMessages(): void {
    this.apiService.getInbox(this.searchQuery, this.sortBy, this.sortDirection).subscribe(messages => {
      this.messages = messages;
    });
  }

  searchMessages(): void {
    this.fetchMessages();
  }

  sortMessages(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.fetchMessages();
  }
}
