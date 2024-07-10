import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';
import {Message} from '../../model/message';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  searchQuery: string = '';
  messageType: 'inbox' | 'outbox' = 'inbox';
  sortColumn: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  page: number = 1;
  limit: number = 10;
  totalMessages: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  get totalPages(): number {
    return Math.ceil(this.totalMessages / this.limit);
  }

  toggleMessageType(type: 'inbox' | 'outbox'): void {
    this.messageType = type;
    this.page = 1;  // reset to page 1 when toggling
    this.loadMessages();
  }

  filterMessages(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredMessages = this.messages.filter(message => {
      const fieldsToSearch = this.messageType === 'inbox'
        ? [message.senderUsername, message.title, message.content]
        : [message.receiverUsername, message.title, message.content];
      return fieldsToSearch.some(field => field.toLowerCase().includes(query));
    });
  }

  searchMessages(): void {
    this.filterMessages();
  }

  sortMessages(column: string): void {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.loadMessages();
  }

  loadMessages(): void {
    let params = new HttpParams()
      .set('sortBy', this.sortColumn)
      .set('order', this.sortOrder)
      .set('page', this.page)
      .set('limit', this.limit);

    const messageObservable = this.messageType === 'inbox'
      ? this.apiService.getInbox(params)
      : this.apiService.getOutbox(params);

    messageObservable.subscribe((response: { messages: Message[], totalMessages: number }) => {
      this.messages = response.messages;
      this.totalMessages = response.totalMessages;
      this.filterMessages();
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.page = page;
    this.loadMessages();
  }
}
