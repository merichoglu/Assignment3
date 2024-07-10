import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode'; // Correct import for named export
import {User} from 'src/app/model/user';
import {Message} from 'src/app/model/message';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:4000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

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

  getUsers(sortBy: string = 'username', sortDirection: string = 'asc', searchQuery: string = ''): Observable<User[]> {
    const headers = this.getAuthHeaders().headers;
    let params = new HttpParams();
    params = params.append('sortBy', sortBy);
    params = params.append('sortDirection', sortDirection);
    if (searchQuery) {
      params = params.append('searchQuery', searchQuery);
    }
    return this.http.get<User[]>(`${this.baseUrl}/users`, { headers, params });
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
