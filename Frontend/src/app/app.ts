import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('blogApp');

  constructor(private router: Router, private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Fetching user role from API...');
      this.http.get<{ roles: string[] }>('http://localhost:8181/api/users/me').subscribe({
        next: (user) => {
          console.log('User data from API:', user);
          const role = user.roles && user.roles.length > 0 ? user.roles[0] : 'USER';
          console.log('User role:', role);
          if (role === 'ROLE_ADMIN') {
            console.log('Navigating to admin-dashboard');
            this.router.navigate(['/admin-dashboard']);
          } else {
            console.log('Navigating to dashboard');
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          console.error('Error fetching user role:', err);
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
