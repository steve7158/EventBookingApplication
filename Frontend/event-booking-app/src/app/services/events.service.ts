import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap, of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventTimeSlot } from '../models/event.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private baseUrl = environment.backendurl;
  private eventsSubject = new BehaviorSubject<any[]>([]);
  public events$ = this.eventsSubject.asObservable();
  private eventsLoaded = false;

  constructor(private http: HttpClient, private authService: AuthService) {
    // Don't automatically load events in constructor
    // Let components decide when to load
  }

  createEvent(eventData: any): Observable<any> {
    const authToken = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
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
          const currentEvents = this.eventsSubject.value;
          this.eventsSubject.next([...currentEvents, response]);
        }
      })
    );
  }

  getEvents(): Observable<any[]> {
    // If events are already loaded, return cached data
    if (this.eventsLoaded) {
      return of(this.eventsSubject.value);
    }

    // Otherwise, fetch from server
    return this.fetchEventsFromServer();
  }

  refreshEvents(): Observable<any[]> {
    // Force refresh from server
    return this.fetchEventsFromServer();
  }

  private fetchEventsFromServer(): Observable<any[]> {
    const authToken = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });
    
    return this.http.get<any[]>(
      `${this.baseUrl}events/getAllEvents`,
      { headers }
    ).pipe(
      tap(response => {
        // Store the events and mark as loaded
        const events = response || [];
        this.eventsSubject.next(events);
        this.eventsLoaded = true;
      })
    );
  }

  getTimeSlots(): any[] {
    return this.eventsSubject.value;
  }

  // Get events as observable for reactive components
  getEventsObservable(): Observable<any[]> {
    if (!this.eventsLoaded) {
      this.fetchEventsFromServer().subscribe();
    }
    return this.events$;
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
