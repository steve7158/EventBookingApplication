import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserPreferences } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private preferences = new BehaviorSubject<UserPreferences>({
    userId: 'user123',
    selectedCategories: []
  });

  constructor() {
    // Load preferences from localStorage if available
    this.loadPreferences();
  }

  getPreferences(): Observable<UserPreferences> {
    return this.preferences.asObservable();
  }

  updateSelectedCategories(categoryIds: string[]): void {
    const currentPrefs = this.preferences.value;
    const updatedPrefs: UserPreferences = {
      ...currentPrefs,
      selectedCategories: categoryIds
    };
    
    this.preferences.next(updatedPrefs);
    this.savePreferences(updatedPrefs);
  }

  private loadPreferences(): void {
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        const parsedPrefs: UserPreferences = JSON.parse(savedPrefs);
        this.preferences.next(parsedPrefs);
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }

  private savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }
}
