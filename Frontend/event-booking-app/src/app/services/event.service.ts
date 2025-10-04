import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventTimeSlot, EventCategory } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private timeSlots = new BehaviorSubject<EventTimeSlot[]>([]);
  private categories = new BehaviorSubject<EventCategory[]>([
    { id: '1', name: 'Cat 1', description: 'Category 1 Events' },
    { id: '2', name: 'Cat 2', description: 'Category 2 Events' },
    { id: '3', name: 'Cat 3', description: 'Category 3 Events' }
  ]);

  // Mock user ID for demo purposes
  private currentUserId = 'user123';

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const today = new Date();
    const mockTimeSlots: EventTimeSlot[] = [
      {
        id: '1',
        categoryId: '1',
        categoryName: 'Cat 1',
        title: 'Morning Session - Cat 1',
        description: 'Morning event for Category 1',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
        maxAttendees: 20,
        currentAttendees: 5,
        attendeeIds: ['user1', 'user2', 'user3', 'user4', 'user5']
      },
      {
        id: '2',
        categoryId: '2',
        categoryName: 'Cat 2',
        title: 'Afternoon Workshop - Cat 2',
        description: 'Afternoon workshop for Category 2',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 14, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 16, 0),
        maxAttendees: 15,
        currentAttendees: 3,
        attendeeIds: ['user6', 'user7', 'user8']
      },
      {
        id: '3',
        categoryId: '3',
        categoryName: 'Cat 3',
        title: 'Evening Seminar - Cat 3',
        description: 'Evening seminar for Category 3',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 18, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 20, 0),
        maxAttendees: 25,
        currentAttendees: 12,
        attendeeIds: []
      },
      {
        id: '4',
        categoryId: '1',
        categoryName: 'Cat 1',
        title: 'Weekly Meeting',
        description: 'Regular weekly team meeting',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 12, 0),
        maxAttendees: 12,
        currentAttendees: 12,
        attendeeIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12']
      },
      {
        id: '5',
        categoryId: '2',
        categoryName: 'Cat 2',
        title: 'Training Session',
        description: 'Skills development training',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 13, 30),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 15, 30),
        maxAttendees: 18,
        currentAttendees: 8,
        attendeeIds: ['user1', 'user3', 'user5', 'user7', 'user9', 'user11', 'user13', 'user15']
      },
      {
        id: '6',
        categoryId: '3',
        categoryName: 'Cat 3',
        title: 'Today\'s Event',
        description: 'Event happening today',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
        maxAttendees: 10,
        currentAttendees: 2,
        attendeeIds: ['user1', 'user2']
      },
      {
        id: '7',
        categoryId: '1',
        categoryName: 'Cat 1',
        title: 'Multiple Events Same Day',
        description: 'Second event on the same day',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0),
        maxAttendees: 8,
        currentAttendees: 3,
        attendeeIds: ['user10', 'user11', 'user12']
      }
    ];

    // Set registration status for current user
    mockTimeSlots.forEach(slot => {
      slot.isUserRegistered = slot.attendeeIds.includes(this.currentUserId);
    });

    this.timeSlots.next(mockTimeSlots);
  }

  getCategories(): Observable<EventCategory[]> {
    return this.categories.asObservable();
  }

  getTimeSlots(): Observable<EventTimeSlot[]> {
    return this.timeSlots.asObservable();
  }

  getTimeSlotsForCategories(categoryIds: string[]): Observable<EventTimeSlot[]> {
    return new Observable(observer => {
      this.timeSlots.subscribe(slots => {
        const filteredSlots = slots.filter(slot => categoryIds.includes(slot.categoryId));
        observer.next(filteredSlots);
      });
    });
  }

  addTimeSlot(timeSlot: Omit<EventTimeSlot, 'id' | 'currentAttendees' | 'attendeeIds' | 'isUserRegistered'>): void {
    const currentSlots = this.timeSlots.value;
    const newTimeSlot: EventTimeSlot = {
      ...timeSlot,
      id: Date.now().toString(),
      currentAttendees: 0,
      attendeeIds: [],
      isUserRegistered: false
    };
    this.timeSlots.next([...currentSlots, newTimeSlot]);
  }

  registerForEvent(eventId: string): Observable<boolean> {
    return new Observable(observer => {
      const currentSlots = this.timeSlots.value;
      const slotIndex = currentSlots.findIndex(slot => slot.id === eventId);
      
      if (slotIndex !== -1) {
        const slot = currentSlots[slotIndex];
        
        if (!slot.isUserRegistered && slot.currentAttendees < slot.maxAttendees) {
          slot.attendeeIds.push(this.currentUserId);
          slot.currentAttendees++;
          slot.isUserRegistered = true;
          
          this.timeSlots.next([...currentSlots]);
          observer.next(true);
        } else {
          observer.next(false);
        }
      } else {
        observer.next(false);
      }
      
      observer.complete();
    });
  }

  unregisterFromEvent(eventId: string): Observable<boolean> {
    return new Observable(observer => {
      const currentSlots = this.timeSlots.value;
      const slotIndex = currentSlots.findIndex(slot => slot.id === eventId);
      
      if (slotIndex !== -1) {
        const slot = currentSlots[slotIndex];
        
        if (slot.isUserRegistered) {
          const userIndex = slot.attendeeIds.indexOf(this.currentUserId);
          if (userIndex !== -1) {
            slot.attendeeIds.splice(userIndex, 1);
            slot.currentAttendees--;
            slot.isUserRegistered = false;
            
            this.timeSlots.next([...currentSlots]);
            observer.next(true);
          } else {
            observer.next(false);
          }
        } else {
          observer.next(false);
        }
      } else {
        observer.next(false);
      }
      
      observer.complete();
    });
  }
}
