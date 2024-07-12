import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-access-logs',
  templateUrl: './access-logs.component.html',
  styleUrls: ['./access-logs.component.scss']
})
export class AccessLogsComponent implements OnInit {
  accessLogs: any[] = [];
  totalLogs: number = 0;
  sortBy: string = 'accessLogs.loginTime';
  sortOrder: string = 'asc';
  page: number = 1;
  limit: number = 10;
  filter: string = '';

  constructor(private apiService: ApiService) {}
  protected readonly Math = Math;

  ngOnInit(): void {
    this.loadAccessLogs();
  }

  loadAccessLogs(): void {
    this.apiService.getAccessLogs(this.sortBy, this.sortOrder, this.page, this.limit, this.filter).subscribe(
      (response: { users: any[], totalLogs: number }) => {
        this.accessLogs = response.users.flatMap(user => user.accessLogs.map(log => ({ ...log, username: user.username })));
        this.totalLogs = response.totalLogs;
      },
      error => console.error('Error fetching access logs', error)
    );
  }

  sortLogs(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadAccessLogs();
  }

  changePage(page: number): void {
    if (page > 0 && page <= Math.ceil(this.totalLogs / this.limit)) {
      this.page = page;
      this.loadAccessLogs();
    }
  }

  applyFilter(): void {
    this.page = 1;
    this.loadAccessLogs();
  }
}
