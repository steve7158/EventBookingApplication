import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, SignupRequest } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  userName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.error = null;
    
    // Validation
    if (!this.userName || !this.confirmPassword || !this.password) {
      this.error = 'All fields are required';
      return;
    }
    
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    
    try {
      const signupData: SignupRequest = {
        username: this.userName,
        password: this.password,
      };

      await this.authService.signup(signupData).subscribe({
        next: (response) => {
          console.log('Signup successful', response);
          this.router.navigate(['/login']);
        },
        error: (e: any) => {
          console.error('Signup error:', e);
          this.error = e.error?.message || e.message || 'Signup failed. Please try again.';
        }
      });
      
    } catch (e: any) {
      console.error('Signup error:', e);
      this.error = e.error?.message || e.message || 'Signup failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
