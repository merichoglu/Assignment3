import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-access-logs',
  templateUrl: './access-logs.component.html',
  styleUrls: ['./access-logs.component.scss']
})
export class AccessLogsComponent implements OnInit {
  accessLogs: any[] = [];
  selectedUserLogs: any[] = [];
  selectedUser: string | null = null;
  sortColumn: string = 'loginTime';
  sortOrder: string = 'asc';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAccessLogs();
  }

  loadAccessLogs(sortBy = this.sortColumn, order = this.sortOrder): void {
    this.apiService.getAccessLogs(sortBy, order).subscribe(
      (logs: any[]) => {
        this.accessLogs = logs;
        if (this.accessLogs.length > 0) {
          this.selectUser(this.accessLogs[0].username); // Default select the first user
        }
      },
      error => console.error('Error fetching access logs', error)
    );
  }

  selectUser(username: string): void {
    this.selectedUser = username;
    const userLogs = this.accessLogs.find(user => user.username === username);
    this.selectedUserLogs = userLogs ? userLogs.accessLogs : [];
  }

  sortLogs(column: string): void {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }

    this.loadAccessLogs(this.sortColumn, this.sortOrder);
  }
}
