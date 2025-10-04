import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EventCategory, UserPreferences } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { UserPreferencesService } from '../../services/user-preferences.service';

@Component({
  selector: 'app-user-preferences',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './user-preferences.component.html',
  styleUrl: './user-preferences.component.scss'
})
export class UserPreferencesComponent implements OnInit {
  categories: EventCategory[] = [];
  selectedCategories: string[] = [];
  userPreferences: UserPreferences | null = null;

  constructor(
    private eventService: EventService,
    private userPreferencesService: UserPreferencesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadUserPreferences();
  }

  private loadCategories(): void {
    this.eventService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  private loadUserPreferences(): void {
    this.userPreferencesService.getPreferences().subscribe(preferences => {
      this.userPreferences = preferences;
      this.selectedCategories = [...preferences.selectedCategories];
    });
  }

  onCategoryToggle(categoryId: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories.push(categoryId);
      }
    } else {
      const index = this.selectedCategories.indexOf(categoryId);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      }
    }
  }

  savePreferences(): void {
    this.userPreferencesService.updateSelectedCategories(this.selectedCategories);
    this.snackBar.open('Preferences saved successfully!', 'Close', {
      duration: 3000
    });
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }
}
