import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventTimeSlot, UserPreferences } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { UserPreferencesService } from '../../services/user-preferences.service';

interface CalendarDay {
  date: Date;
  events: EventTimeSlot[];
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
    MatProgressSpinnerModule
  ],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit {
  timeSlots: EventTimeSlot[] = [];
  userPreferences: UserPreferences | null = null;
  loading = false;
  
  // Calendar-specific properties
  currentDate = new Date();
  currentWeekStart = new Date();
  weekDays: CalendarDay[] = [];
  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private eventService: EventService,
    private userPreferencesService: UserPreferencesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setCurrentWeek();
    this.loadUserPreferences();
  }

  private setCurrentWeek(): void {
    const today = new Date();
    // Set to start of current week (Sunday)
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() - today.getDay());
    this.generateWeek();
  }

  private loadUserPreferences(): void {
    this.userPreferencesService.getPreferences().subscribe(preferences => {
      this.userPreferences = preferences;
      this.loadTimeSlots();
    });
  }

  private loadTimeSlots(): void {
    if (!this.userPreferences || this.userPreferences.selectedCategories.length === 0) {
      this.timeSlots = [];
      this.generateWeek();
      return;
    }

    this.loading = true;
    this.eventService.getTimeSlotsForCategories(this.userPreferences.selectedCategories)
      .subscribe({
        next: (slots) => {
          this.timeSlots = slots.sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          this.loading = false;
          this.generateWeek();
        },
        error: (error) => {
          console.error('Error loading time slots:', error);
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

  private getEventsForDate(date: Date): EventTimeSlot[] {
    return this.timeSlots.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
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

  registerForEvent(event: EventTimeSlot): void {
    if (event.isUserRegistered || event.currentAttendees >= event.maxAttendees) {
      return;
    }

    this.eventService.registerForEvent(event.id).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Successfully registered for the event!', 'Close', {
            duration: 3000
          });
        } else {
          this.snackBar.open('Failed to register for the event.', 'Close', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.snackBar.open('An error occurred during registration.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  unregisterFromEvent(event: EventTimeSlot): void {
    if (!event.isUserRegistered) {
      return;
    }

    this.eventService.unregisterFromEvent(event.id).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Successfully unregistered from the event!', 'Close', {
            duration: 3000
          });
        } else {
          this.snackBar.open('Failed to unregister from the event.', 'Close', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Unregistration error:', error);
        this.snackBar.open('An error occurred during unregistration.', 'Close', {
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

  isEventFull(event: EventTimeSlot): boolean {
    return event.currentAttendees >= event.maxAttendees;
  }
}
