import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface PostDetail {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
  authorId: number;
  authorName: string;
  categoryId: number;
  categoryName: string;
  commentCount: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  posts: PostDetail[] = [];
  users: User[] = [];
  loading: boolean = true;
  error: string = '';
  currentUserEmail: string = '';
  currentUserId: number = 0;
  currentUserRole: string = '';

  get isAdmin(): boolean {
    return this.currentUserRole === 'ROLE_ADMIN';
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
      this.http.get<{ email: string; id: number; roles: string[] }>('http://localhost:8181/api/users/me').subscribe({
        next: (user) => {
          this.currentUserEmail = user.email;
          this.currentUserId = user.id;
          this.currentUserRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'USER';
          if (this.isAdmin) {
            this.router.navigate(['/admin-dashboard']);
            return;
          }
          this.fetchUserPosts();
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

  fetchUserPosts() {
    this.fetchAllPosts(0, []);
  }

  fetchAllPosts(page: number, allPosts: PostDetail[]) {
    this.http.get<{ content: PostDetail[]; last: boolean }>('http://localhost:8181/api/posts?page=' + page).subscribe({
      next: (response) => {
        allPosts = allPosts.concat(response.content);
        if (!response.last) {
          this.fetchAllPosts(page + 1, allPosts);
        } else {
          console.log('All posts:', allPosts);
          console.log('Current user email:', this.currentUserEmail);
          console.log('Current user ID:', this.currentUserId);
          allPosts.forEach(post => console.log('Post authorId:', post.authorId, 'authorName:', post.authorName));
          this.posts = allPosts.filter(post => post.authorId === this.currentUserId);
          console.log('Filtered posts:', this.posts);
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Failed to load posts.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error fetching user posts:', err);
      }
    });
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

  canEdit(post: PostDetail): boolean {
    return (post.authorName.toLowerCase() === this.currentUserEmail.split('@')[0].toLowerCase()) || (this.currentUserRole === 'ROLE_ADMIN');
  }

  editPost(post: PostDetail) {
    if (this.canEdit(post)) {
      this.router.navigate(['/edit-post', post.id]);
    }
  }

  viewPost(postId: number) {
    this.router.navigate(['/post', postId]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
