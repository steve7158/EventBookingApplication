import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  userName = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  async onSubmit() {
    this.error = null;
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    try {
      // TODO: Inject a real auth service and call backend /users/signup
      console.log('Signup attempt', { userName: this.userName });
      await new Promise(r => setTimeout(r, 400));
    } catch (e: any) {
      this.error = e.message || 'Signup failed';
    } finally {
      this.loading = false;
    }
  }
}
