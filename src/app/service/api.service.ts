import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Correct import for named export
import { User } from 'src/app/model/user';
import { Message } from 'src/app/model/message';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:4000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response && response.token) {
          const decodedToken: any = jwtDecode(response.token);
          localStorage.setItem('token', response.token);
          localStorage.setItem('isAdmin', decodedToken.isAdmin);
          const user: User = {
            username: decodedToken.username,
            isAdmin: decodedToken.isAdmin,
            email: decodedToken.email || '',
            name: decodedToken.name || '',
            surname: decodedToken.surname || '',
            birthdate: decodedToken.birthdate || '',
            gender: decodedToken.gender || '',
            location: decodedToken.location || '',
            accessLogs: []
          };
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<{ users: User[] }>(`${this.baseUrl}/users`, this.getAuthHeaders()).pipe(
      map(response => response.users)
    );
  }

  getUser(username: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${username}`, this.getAuthHeaders());
  }

  addUser(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/add`, user, this.getAuthHeaders());
  }

  updateUser(username: string, user: User): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/update/${username}`, user, this.getAuthHeaders());
  }


  deleteUser(username: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/delete/${username}`, this.getAuthHeaders());
  }

  getInbox(searchQuery: string = '', sortBy: string = 'timestamp', sortDirection: 'asc' | 'desc' = 'asc'): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages/inbox`, {
      params: { searchQuery, sortBy, sortDirection },
      headers: this.getAuthHeaders().headers
    });
  }

  getOutbox(searchQuery: string = '', sortBy: string = 'timestamp', sortDirection: 'asc' | 'desc' = 'asc'): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages/outbox`, {
      params: { searchQuery, sortBy, sortDirection },
      headers: this.getAuthHeaders().headers
    });
  }

  sendMessage(message: Message): Observable<any> {
    return this.http.post(`${this.baseUrl}/messages/send`, message, this.getAuthHeaders());
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
