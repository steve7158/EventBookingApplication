import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-preferences',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './user-preferences.component.html',
  styleUrl: './user-preferences.component.scss'
})
export class UserPreferencesComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<string[]>();
  
  categories = environment.categories.map(cat => ({ id: cat, name: cat }));
  
  selectedCategories: string[] = [];
  isExpanded: boolean = false;

  constructor(
    private userPreferencesService: UserPreferencesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserPreferences();
  }

  private loadUserPreferences(): void {
    this.userPreferencesService.getPreferences().subscribe(preferences => {
      this.selectedCategories = [...preferences.selectedCategories];
      this.emitFiltersChanged();
    });
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
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

  clearAll(): void {
    this.selectedCategories = [];
  }

  selectAll(): void {
    this.selectedCategories = this.categories.map(cat => cat.id);
  }

  applyFilters(): void {
    this.userPreferencesService.updateSelectedCategories(this.selectedCategories);
    this.emitFiltersChanged();
    this.isExpanded = false;
    
    const message = this.selectedCategories.length === 0 
      ? 'Showing all events' 
      : `Filtering by ${this.selectedCategories.length} categories`;
      
    this.snackBar.open(message, 'Close', {
      duration: 2000
    });
  }

  private emitFiltersChanged(): void {
    this.filtersChanged.emit(this.selectedCategories);
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  }
}
