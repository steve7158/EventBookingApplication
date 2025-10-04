import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { EventCategory, EventTimeSlot } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-admin-view',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './admin-view.component.html',
  styleUrl: './admin-view.component.scss'
})
export class AdminViewComponent implements OnInit {
  eventForm: FormGroup;
  categories: EventCategory[] = [];
  timeSlots: EventTimeSlot[] = [];
  displayedColumns: string[] = ['title', 'category', 'date', 'time', 'attendees', 'actions'];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      categoryId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      maxAttendees: [10, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTimeSlots();
  }

  private loadCategories(): void {
    this.eventService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  private loadTimeSlots(): void {
    this.eventService.getTimeSlots().subscribe(slots => {
      this.timeSlots = slots.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      
      // Combine date and time
      const startDateTime = this.combineDateTime(formValue.date, formValue.startTime);
      const endDateTime = this.combineDateTime(formValue.date, formValue.endTime);
      
      if (endDateTime <= startDateTime) {
        this.snackBar.open('End time must be after start time', 'Close', {
          duration: 3000
        });
        return;
      }

      const selectedCategory = this.categories.find(cat => cat.id === formValue.categoryId);
      
      const newTimeSlot = {
        categoryId: formValue.categoryId,
        categoryName: selectedCategory?.name || '',
        title: formValue.title,
        description: formValue.description,
        startTime: startDateTime,
        endTime: endDateTime,
        maxAttendees: formValue.maxAttendees
      };

      this.eventService.addTimeSlot(newTimeSlot);
      
      this.snackBar.open('Event time slot created successfully!', 'Close', {
        duration: 3000
      });
      
      this.eventForm.reset();
      this.loadTimeSlots(); // Refresh the list
    } else {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000
      });
    }
  }

  private combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  }
}
