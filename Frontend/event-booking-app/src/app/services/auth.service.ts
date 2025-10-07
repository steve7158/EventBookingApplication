import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  userName: string;
  accessLevel: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  accessLevel: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.backendurl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load existing token and user from localStorage on service initialization
    this.loadStoredAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.baseUrl}users/login`,
      credentials,
      { headers }
    ).pipe(
      tap(response => {
        if (response.accessToken) {
          // Create user object from response data
          const user: User = {
            id: response.userId,
            username: response.userName,
            email: '', // Not provided in AuthResponse
            accessLevel: response.accessLevel // Not provided in AuthResponse
          };
          // Store token and user data
          this.setAuthData(response.accessToken, user);
        }
      })
    );
  }

  logout(): void {
    // Clear stored authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
    // Reset subjects
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private setAuthData(token: string, user: User): void {
    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
    
    // Update subjects
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');
    
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading stored authentication data:', error);
        this.logout(); // Clear invalid data
      }
    }
  }
}