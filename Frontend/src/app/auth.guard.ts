import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) {}

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.http.get<{ roles: string[] }>('http://localhost:8181/api/users/me').pipe(
      map(user => {
        const role = user.roles && user.roles.length > 0 ? user.roles[0] : 'USER';
        return true; // Allow access, but we'll handle redirection in components
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) {}

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.http.get<{ roles: string[] }>('http://localhost:8181/api/users/me').pipe(
      map(user => {
        console.log('AdminGuard - Full user data:', user);
        const role = user.roles && user.roles.length > 0 ? user.roles[0] : 'USER';
        console.log('AdminGuard - User role:', role);
        if (role === 'ROLE_ADMIN') {
          console.log('AdminGuard - Allowing access to admin-dashboard');
          return true;
        } else {
          console.log('AdminGuard - Redirecting to dashboard');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }),
      catchError((err) => {
        console.error('AdminGuard - Error fetching user:', err);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
