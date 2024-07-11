import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-access-logs',
  templateUrl: './access-logs.component.html',
  styleUrls: ['./access-logs.component.scss']
})
export class AccessLogsComponent implements OnInit {
  users: any[] = [];
  selectedUser: string | null = null;
  selectedUserLogs: any[] = [];
  sortBy: string = 'accessLogs.loginTime';
  sortDirection: string = 'asc';
  page: number = 1;
  limit: number = 10;
  totalLogs: number = 0;

  constructor(private apiService: ApiService) {}
  protected readonly Math = Math;

  ngOnInit(): void {
    this.loadLogs();
  }

  selectUser(username: string): void {
    this.selectedUser = username;
    this.updateSelectedUserLogs();
  }

  loadLogs(): void {
    this.apiService.getAccessLogs(this.sortBy, this.sortDirection, this.page, this.limit).subscribe((data: any) => {
      this.users = data.users;
      this.totalLogs = data.totalLogs;
      if (this.users.length > 0 && !this.selectedUser) {
        this.selectUser(this.users[0].username);
      }
    });
  }

  updateSelectedUserLogs(): void {
    if (this.selectedUser) {
      const user = this.users.find(u => u.username === this.selectedUser);
      this.selectedUserLogs = user ? user.accessLogs : [];
    }
  }

  sortLogs(column: string): void {
    this.sortBy = column;
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadLogs(); // Reload logs with new sorting
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= Math.ceil(this.totalLogs / this.limit)) {
      this.page = newPage;
      this.loadLogs(); // Reload logs with new page
    }
  }
}
