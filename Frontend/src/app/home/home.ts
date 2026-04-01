import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Post {
  id: string | number;
  title: string;
  content: string;
  userId?: number;
  imageUrl?: string;
  published?: boolean;
  authorId?: number;
  authorName?: string;
  categoryId?: number;
  categoryName?: string;
  commentCount?: number;
}

interface PostsResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Post[];
  number: number;
  sort: any;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: any;
  empty: boolean;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  posts: Post[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.fetchPosts();
  }

  fetchPosts() {
    this.loading = true;
    this.error = '';

    this.http.get<PostsResponse>('http://localhost:8181/api/posts').subscribe({
      next: (response) => {
        this.posts = response.content;
        console.log(this.posts);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load posts. Please try again later.';
        this.loading = false;
        console.error('Error fetching posts:', err);
        this.cdr.detectChanges();
      }
    });
  }

  viewPost(postId: string | number) {
    this.router.navigate(['/post', postId]);
  }

  createPost() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/create-post']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
