import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';
import {User} from 'src/app/model/user';
import {Message} from 'src/app/model/message';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:4000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private isAdminSubject = new BehaviorSubject<boolean>(this.isAdminUser());

  constructor(private http: HttpClient) {
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  isAdmin(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, {username, password}).pipe(
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
          this.isAuthenticatedSubject.next(true);
          this.isAdminSubject.next(decodedToken.isAdmin);
        }
      })
    );
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/auth/logout`, {}, {headers}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.isAdminSubject.next(false);
      })
    );
  }

  getUsers(page: number, limit: number, sortBy: string, order: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);

    return this.http.get<any>(`${this.baseUrl}/users`, {headers, params});
  }

  getUser(username: string): Observable<User> {
    const headers = this.getAuthHeaders().headers;
    return this.http.get<User>(`${this.baseUrl}/users/${username}`, {headers});
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

  getInbox(params: HttpParams): Observable<{ messages: Message[], totalMessages: number }> {
    return this.http.get<{
      messages: Message[],
      totalMessages: number
    }>(`${this.baseUrl}/messages/inbox`, {headers: this.getAuthHeaders().headers, params});
  }

  getOutbox(params: HttpParams): Observable<{ messages: Message[], totalMessages: number }> {
    return this.http.get<{
      messages: Message[],
      totalMessages: number
    }>(`${this.baseUrl}/messages/outbox`, {headers: this.getAuthHeaders().headers, params});
  }

  sendMessage(message: Message): Observable<any> {
    return this.http.post(`${this.baseUrl}/messages/send`, message, this.getAuthHeaders());
  }

  // Method for typeahead search (no auth header required)
  getTypeaheadUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/typeahead`, this.getAuthHeaders());
  }

  deleteInboxMessage(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.delete(`${this.baseUrl}/messages/delete/${id}`, {headers});
  }

  deleteOutboxMessage(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.delete(`${this.baseUrl}/messages/delete/${id}`, {headers});
  }

  getAccessLogs(sortBy: string, order: string, page: number, limit: number, filter: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('order', order)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('filter', filter);

    return this.http.get<any>(`${this.baseUrl}/users/access-logs`, {headers, params});
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private isAdminUser(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.isAdmin;
    }
    return false;
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
