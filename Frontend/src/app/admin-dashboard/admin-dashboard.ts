import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  users: User[] = [];
  loading: boolean = true;
  error: string = '';
  currentUserEmail: string = '';
  currentUserRole: string = '';
  selectedFilter: string = 'all';

  get totalUsers(): number {
    return this.users.length;
  }

  get adminCount(): number {
    return this.users.filter(user => user.roles && user.roles.includes('ROLE_ADMIN')).length;
  }

  get userCount(): number {
    return this.users.filter(user => user.roles && user.roles.includes('ROLE_USER') && !user.roles.includes('ROLE_ADMIN') && !user.roles.includes('ROLE_AUTHOR')).length;
  }

  get authorCount(): number {
    return this.users.filter(user => user.roles && user.roles.includes('ROLE_AUTHOR') && !user.roles.includes('ROLE_ADMIN')).length;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.http.get<{ email: string; roles: string[] }>('http://localhost:8181/api/users/me').subscribe({
        next: (user) => {
          this.currentUserEmail = user.email;
          this.currentUserRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'USER';
          this.fetchAllUsers();
        },
        error: (err) => {
          console.error('Error fetching user details:', err);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchAllUsers() {
    this.http.get<User[]>('http://localhost:8181/api/users').subscribe({
      next: (response) => {
        console.log('All users:', response);
        this.users = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load users.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error fetching users:', err);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getPrimaryRole(user: User): string {
    if (user.roles && user.roles.includes('ROLE_ADMIN')) {
      return 'ROLE_ADMIN';
    } else if (user.roles && user.roles.includes('ROLE_AUTHOR')) {
      return 'ROLE_AUTHOR';
    } else if (user.roles && user.roles.includes('ROLE_USER')) {
      return 'ROLE_USER';
    }
    return 'ROLE_USER'; // default
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'admin-role';
      case 'ROLE_USER':
        return 'user-role';
      case 'ROLE_AUTHOR':
        return 'author-role';
      default:
        return 'default-role';
    }
  }

  canUpgradeToAuthor(user: User): boolean {
    return user.roles && user.roles.includes('ROLE_USER') &&
           !user.roles.includes('ROLE_AUTHOR') &&
           !user.roles.includes('ROLE_ADMIN');
  }

  upgradeToAuthor(userId: number) {
    this.http.put(`http://localhost:8181/api/users/${userId}/upgrade-author`, {}, { responseType: 'text' }).subscribe({
      next: () => {
        console.log('User upgraded to author successfully');
        this.fetchAllUsers(); // Refresh the users list
      },
      error: (err) => {
        console.error('Error upgrading user to author:', err);
        this.error = `Failed to upgrade user to author: ${err.error?.message || err.message || 'Unknown error'}`;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredUsers(): User[] {
    if (this.selectedFilter === 'all') {
      return this.users;
    } else if (this.selectedFilter === 'admin') {
      return this.users.filter(user => this.getPrimaryRole(user) === 'ROLE_ADMIN');
    } else if (this.selectedFilter === 'author') {
      return this.users.filter(user => this.getPrimaryRole(user) === 'ROLE_AUTHOR');
    } else if (this.selectedFilter === 'user') {
      return this.users.filter(user => this.getPrimaryRole(user) === 'ROLE_USER');
    }
    return this.users;
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
