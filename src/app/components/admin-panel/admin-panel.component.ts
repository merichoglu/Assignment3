import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { User } from '../../model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  searchQuery: string = '';
  sortBy: string = '';
  sortDirection: string = 'asc';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getUsers().subscribe(
      users => {
        this.users = users;
      },
      error => {
        console.error('Error fetching users:', error);
      }
    );
  }

  searchUsers(): void {
    this.loadUsers();
  }

  editUser(username: string): void {
    this.router.navigate(['/edit-user', username]);
  }

  deleteUser(username: string): void {
    this.apiService.deleteUser(username).subscribe(
      () => {
        this.users = this.users.filter(user => user.username !== username);
      },
      error => {
        console.error('Error deleting user:', error);
      }
    );
  }

  loadUsers() {
    this.apiService.getUsers(this.sortBy, this.sortDirection).subscribe(
      (data: User[]) => {
        this.users = data;
      },
      error => {
        console.error('Error fetching users', error);
      }
    );
  }

  sortUsers(field: string) {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }
}
