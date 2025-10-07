import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventTimeSlot } from '../models/event.model';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private baseUrl = environment.backendurl;
  events: any[] = [];
  private authToken = '';

  constructor(private http: HttpClient, private authService: AuthService) {
    this.getEvents();
    this.authToken = this.authService.getToken() as string;
  }
  createEvent(eventData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}` // Include token if required
    });

    // Format the event data with proper date and time formats
    const formattedEvent = this.formatEventData(eventData);

    return this.http.post<any>(
      `${this.baseUrl}events`,
      formattedEvent,
      { headers: headers }
    ).pipe(
      tap(response => {
        // Add the new event to local events array if creation was successful
        if (response) {
          this.events.push(response);
        }
      })
    );
  }

  getEvents(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}` // Include token if required
    });
    
    return this.http.get<any[]>(
      `${this.baseUrl}events/getAllEvents`,
      { headers }
    ).pipe(
      tap(response => {
        // Store the events instead of trying to create them again
        this.events = response || [];
      })
    );
  }

  getTimeSlots() {
    return this.events;
  }

  private formatEventData(event: any): any {
    // Ensure proper date and time formatting
    const eventDate = new Date(event.date);
    
    // For time inputs, we need to format them as HH:MM:SS
    const formatTimeString = (timeInput: any): string => {
      if (typeof timeInput === 'string' && timeInput.includes(':')) {
        // If it's already in HH:MM format, add seconds
        return timeInput.length === 5 ? `${timeInput}:00` : timeInput;
      } else {
        // If it's a Date object, extract time
        const timeObj = new Date(timeInput);
        return timeObj.toTimeString().split(' ')[0]; // Gets HH:MM:SS
      }
    };

    return {
      title: event.title,
      description: event.description,
      category: event.category,
      max_attendees: event.maxAttendees,
      date: eventDate.toISOString().split('T')[0], // Format: "2025-10-07"
      start_time: formatTimeString(event.startTime), // Format: "14:30:00"
      end_time: formatTimeString(event.endTime) // Format: "16:30:00"
    };
  }

  
}
