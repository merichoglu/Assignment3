import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-access-logs',
  templateUrl: './access-logs.component.html',
  styleUrls: ['./access-logs.component.scss']
})
export class AccessLogsComponent implements OnInit {
  accessLogs: any[] = [];
  selectedUser: string | null = null;
  selectedUserLogs: any[] = [];
  sortColumn: string = 'accessLogs.loginTime';
  sortOrder: string = 'asc';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAccessLogs();
  }

  loadAccessLogs(): void {
    this.apiService.getAccessLogs(this.sortColumn, this.sortOrder).subscribe((users: any[]) => {
      this.accessLogs = users;
      if (this.accessLogs.length > 0) {
        this.selectUser(this.selectedUser || this.accessLogs[0].username);
      }
    });
  }

  selectUser(username: string): void {
    this.selectedUser = username;
    this.updateSelectedUserLogs();
  }

  updateSelectedUserLogs(): void {
    if (this.selectedUser) {
      const user = this.accessLogs.find(u => u.username === this.selectedUser);
      this.selectedUserLogs = user ? user.accessLogs : [];
    }
  }

  sortLogs(column: string): void {
    this.sortColumn = column;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadAccessLogs(); // Reload logs with new sorting
  }
}
