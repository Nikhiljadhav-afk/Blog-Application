import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const loginData = { email: this.email, password: this.password };

    this.http.post('http://localhost:8181/api/auth/login', loginData)
      .subscribe({
        next: (response: any) => {
          this.message = 'Login successful!';
          console.log(response);
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.message = 'Login failed. Please check your credentials.';
          console.error(error);
        }
      });
  }
}
