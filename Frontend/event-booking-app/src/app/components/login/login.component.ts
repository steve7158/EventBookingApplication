import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userName = '';
  password = '';
  loading = false;
  error: string | null = null;

  async onSubmit() {
    this.error = null;
    this.loading = true;
    try {
      // TODO: Inject a real auth service and call backend /users/login
      console.log('Login attempt', { userName: this.userName });
      // Simulate delay
      await new Promise(r => setTimeout(r, 400));
    } catch (e: any) {
      this.error = e.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
