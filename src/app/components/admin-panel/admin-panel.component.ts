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
  searchQuery: string = '';
  filteredUsers: User[] = [];
  sortBy: string = 'username';
  sortDirection: string = 'asc';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
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
    this.apiService.getUsers(this.sortBy, this.sortDirection).subscribe((data: User[]) => {
      this.users = data;
      this.filteredUsers = data;
    });
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

  searchUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.surname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
