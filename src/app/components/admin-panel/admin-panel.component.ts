import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';
import {User} from '../../model/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  totalUsers: number = 0;
  filteredUsers: User[] = [];
  searchQuery: string = '';
  sortBy: string = 'username';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10;
  protected readonly Math = Math;

  constructor(private apiService: ApiService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  editUser(username: string): void {
    this.router.navigate(['/edit-user', username]);
  }

  deleteUser(username: string): void {
    if (window.confirm('Are you sure you want to delete this user?')) {
      this.apiService.deleteUser(username).subscribe(
        () => {
          this.users = this.users.filter(user => user.username !== username);
          this.searchUsers();
          this.loadUsers();
        },
        error => {
          console.error('Error deleting user:', error);
        }
      );
    }
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

  loadUsers(): void {
    this.apiService.getUsers(this.currentPage, 10, this.sortBy, this.sortDirection).subscribe(response => {
      this.users = response.users;
      this.totalPages = response.pages;
      this.totalUsers = response.totalUsers;
      this.searchUsers();
    });
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  searchUsers(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.surname.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.gender.toLowerCase().includes(query) ||
      user.location.toLowerCase().includes(query)
    );
  }
}
