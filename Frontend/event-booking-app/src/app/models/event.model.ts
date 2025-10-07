export interface EventCategory {
  id: string;
  name: string;
  description?: string;
}

export interface EventTimeSlot {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  maxAttendees: number;
  currentAttendees: number;
  attendeeIds: string[];
  isUserRegistered?: boolean;
}

export interface UserPreferences {
  userId: string;
  selectedCategories: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface EventRequest {
  title: string,
  description: string,
  category: string,
  max_attendees: number,
  date: string,
  start_time: string,
  end_time: string
}
