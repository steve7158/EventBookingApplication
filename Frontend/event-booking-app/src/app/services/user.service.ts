import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.backendurl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  addEventToUser(payload: { addEventIds: string[] }): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated or user ID not available');
    }

    const authToken = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    return this.http.put<any>(
      `${this.baseUrl}users/${currentUser.id}/updateUserEvents`,
      payload,
      { headers: headers }
    );
  }

  removeEventFromUser(payload: { removeEventIds: string[] }): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated or user ID not available');
    }

    const authToken = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    return this.http.put<any>(
      `${this.baseUrl}users/${currentUser.id}/updateUserEvents`,
      payload,
      { headers: headers }
    );
  }

  getUserEvents(): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated or user ID not available');
    }

    const authToken = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    return this.http.get<any>(
      `${this.baseUrl}users/${currentUser.id}/getUserEvents`,
      { headers }
    );
  }
}
