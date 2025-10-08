import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventsService } from '../../services/events.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { UserService } from '../../services/user.service';
import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';
interface CalendarDay {
  date: Date;
  events: any[];
  dayNumber: number;
  dayName: string;
  isToday: boolean;
}

@Component({
  selector: 'app-calendar-view',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    UserPreferencesComponent
  ],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit {
  timeSlots: any[] = [];
  userPreferences: any = null;
  userRegisteredEvents: string[] = []; // Store user's registered event IDs
  loading = false;
  
  // Calendar-specific properties
  currentDate = new Date();
  currentWeekStart = new Date();
  weekDays: CalendarDay[] = [];
  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private eventsService: EventsService,
    private userPreferencesService: UserPreferencesService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setCurrentWeekStart();
    this.loadUserRegisteredEvents();
    this.loadUserPreferences();
  }

  private setCurrentWeekStart(): void {
    const today = new Date();
    // Set to start of current week (Sunday)
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() - today.getDay());
    // Don't generate the week here - wait for data to load
  }

  private loadUserRegisteredEvents(): void {
    this.userService.getUserEvents().subscribe({
      next: (response: any) => {
        // Extract event IDs from the response
        if (response && response.events) {
          this.userRegisteredEvents = response.events.map((event: any) => event.id || event.event_id);
        } else if (Array.isArray(response)) {
          this.userRegisteredEvents = response.map((event: any) => event.id || event.event_id);
        } else {
          this.userRegisteredEvents = [];
        }
        console.log('User registered events:', this.userRegisteredEvents);
        // Regenerate the calendar to show updated registration status
        this.generateWeek();
      },
      error: (error: any) => {
        console.error('Error loading user registered events:', error);
        this.userRegisteredEvents = [];
        // Still regenerate the calendar even if there's an error
        this.generateWeek();
      }
    });
  }

  private setCurrentWeek(): void {
    this.setCurrentWeekStart();
    this.generateWeek();
  }

  private loadUserPreferences(): void {
    this.userPreferencesService.getPreferences().subscribe(preferences => {
      this.userPreferences = preferences;
      this.loadTimeSlots();
    });
  }

  private loadTimeSlots(): void {
    this.loading = true;
    this.eventsService.getEvents()
      .subscribe({
        next: (events: any[]) => {
          // Filter events based on user preferences if categories are selected
          if (this.userPreferences && this.userPreferences.selectedCategories.length > 0) {
            this.timeSlots = events.filter(event => 
              this.userPreferences.selectedCategories.includes(event.category)
            );
          } else {
            this.timeSlots = events;
          }
          
          // Sort events by start time
          this.timeSlots = this.timeSlots.sort((a: any, b: any) => 
            new Date(a.start_time || a.startTime).getTime() - new Date(b.start_time || b.startTime).getTime()
          );
          this.loading = false;
          this.generateWeek();
        },
        error: (error: any) => {
          console.error('Error loading events:', error);
          this.loading = false;
          this.generateWeek();
        }
      });
  }

  private generateWeek(): void {
    this.weekDays = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(this.currentWeekStart);
      currentDay.setDate(this.currentWeekStart.getDate() + i);
      
      const dayEvents = this.getEventsForDate(currentDay);
      
      this.weekDays.push({
        date: new Date(currentDay),
        events: dayEvents,
        dayNumber: currentDay.getDate(),
        dayName: this.dayNames[currentDay.getDay()],
        isToday: this.isToday(currentDay)
      });
    }
  }

  private getEventsForDate(date: Date): any[] {
    const eventsForDate = this.timeSlots.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });

    // Add registration status to each event
    const eventsWithRegistrationStatus = eventsForDate.map(event => ({
      ...event,
      isUserRegistered: this.userRegisteredEvents.includes(event.id)
    }));

    return eventsWithRegistrationStatus.sort((a: any, b: any) => 
      new Date(a.start_time || a.startTime).getTime() - new Date(b.start_time || b.startTime).getTime()
    );
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.generateWeek();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.generateWeek();
  }

  goToCurrentWeek(): void {
    this.setCurrentWeek();
  }

  getCurrentWeekRange(): string {
    const endDate = new Date(this.currentWeekStart);
    endDate.setDate(this.currentWeekStart.getDate() + 6);
    
    const startMonth = this.currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const year = this.currentWeekStart.getFullYear();
    
    if (this.currentWeekStart.getMonth() === endDate.getMonth()) {
      return `${startMonth} ${this.currentWeekStart.getDate()} - ${endDate.getDate()}, ${year}`;
    } else {
      return `${startMonth} ${this.currentWeekStart.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  registerForEvent(event: any): void {
    if (event.isUserRegistered || event.currentAttendees >= event.maxAttendees) {
      return;
    }

    // Use UserService to add event to user
    this.userService.addEventToUser(event.id).subscribe({
      next: (response) => {
        this.snackBar.open('Successfully registered for the event!', 'Close', {
          duration: 3000
        });
        // Add event ID to registered events list
        this.userRegisteredEvents.push(event.id);
        // Refresh the calendar to show updated status
        this.generateWeek();
      },
      error: (error) => {
        console.error('Error registering for event:', error);
        this.snackBar.open('Failed to register for the event. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  unregisterFromEvent(event: any): void {
    if (!event.isUserRegistered) {
      return;
    }

    // Use UserService to remove event from user
    this.userService.removeEventFromUser(event.id).subscribe({
      next: (response) => {
        this.snackBar.open('Successfully unregistered from the event!', 'Close', {
          duration: 3000
        });
        // Remove event ID from registered events list
        this.userRegisteredEvents = this.userRegisteredEvents.filter(id => id !== event.id);
        // Refresh the calendar to show updated status
        this.generateWeek();
      },
      error: (error) => {
        console.error('Error unregistering from event:', error);
        this.snackBar.open('Failed to unregister from the event. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isEventFull(event: any): boolean {
    return event.currentAttendees >= event.maxAttendees;
  }

  // Handle filter changes from user preferences component
  onFiltersChanged(selectedCategories: string[]): void {
    this.userPreferences = { selectedCategories };
    this.loadTimeSlots();
  }
}
