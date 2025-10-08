import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.error = null;
    this.loading = true;
    
    try {
      const credentials: LoginRequest = {
        username: this.username,
        password: this.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          // Navigate to calendar page after successful login
          this.router.navigate(['/calendar']);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.error = error.error?.message || error.message || 'Login failed. Please check your credentials.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } catch (e: any) {
      this.error = e.message || 'Login failed';
      this.loading = false;
    }
  }
}
