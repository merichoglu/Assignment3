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
  searchQuery: string = '';
  messageType: 'inbox' | 'outbox' = 'inbox';
  sortColumn: string = 'timestamp';
  sortOrder: 'asc' | 'desc' = 'desc';
  page: number = 1;
  limit: number = 10;
  totalMessages: number = 0;

  constructor(private apiService: ApiService) {
  }

  get totalPages(): number {
    return Math.ceil(this.totalMessages / this.limit);
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  toggleMessageType(type: 'inbox' | 'outbox'): void {
    this.messageType = type;
    this.page = 1;  // reset to page 1 when toggling
    this.loadMessages();
  }

  sortMessages(column: string): void {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'desc';
    }
    this.loadMessages();
  }

  searchMessages(): void {
    this.page = 1;  // reset to page 1 when searching
    this.loadMessages();
  }

  loadMessages(): void {
    let params = new HttpParams()
      .set('sortBy', this.sortColumn)
      .set('order', this.sortOrder)
      .set('page', this.page.toString())
      .set('limit', this.limit.toString())
      .set('searchQuery', this.searchQuery);

    const messageObservable = this.messageType === 'inbox'
      ? this.apiService.getInbox(params)
      : this.apiService.getOutbox(params);

    messageObservable.subscribe((response: { messages: Message[], totalMessages: number }) => {
      this.messages = response.messages;
      this.totalMessages = response.totalMessages;
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.page = page;
    this.loadMessages();
  }

  deleteMessage(id: string): void {
    if (confirm('Are you sure you want to delete this message?')) {
      const deleteObservable = this.messageType === 'inbox'
        ? this.apiService.deleteInboxMessage(id)
        : this.apiService.deleteOutboxMessage(id);

      deleteObservable.subscribe(
        () => {
          this.loadMessages(); // Refresh after deletion
        },
        error => {
          console.error(error);
        }
      );
    }
  }
}
