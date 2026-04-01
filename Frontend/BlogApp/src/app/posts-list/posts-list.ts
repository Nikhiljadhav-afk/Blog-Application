import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs/operators';

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

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts-list.html',
  styleUrls: ['./posts-list.css']
})
export class PostsList implements OnInit {
  posts: PostDetail[] = [];
  allPosts: PostDetail[] = [];
  filteredPosts: PostDetail[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading: boolean = true;
  error: string = '';
  success: string = '';
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 6;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkAdminStatus();
    this.fetchPosts();
  }

  fetchPosts() {
    this.loading = true;
    this.http.get<{ content: PostDetail[] }>('http://localhost:8181/api/posts?page=0&size=1000').pipe(
      timeout(10000) // 10 second timeout
    ).subscribe({
      next: (response) => {
        console.log('PostsList fetchPosts success', response);
        this.allPosts = response.content;
        this.extractCategories();
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('PostsList fetchPosts error', err);
        this.error = 'Failed to load posts.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  extractCategories() {
    this.categories = [...new Set(this.allPosts.map(post => post.categoryName))];
  }

  applyFilter() {
    if (this.selectedCategory) {
      this.filteredPosts = this.allPosts.filter(post => post.categoryName === this.selectedCategory);
    } else {
      this.filteredPosts = [...this.allPosts];
    }
    this.totalPages = Math.ceil(this.filteredPosts.length / this.pageSize);
    this.currentPage = 0;
    this.updateCurrentPagePosts();
  }

  onCategoryChange() {
    this.applyFilter();
  }

  updateCurrentPagePosts() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.posts = this.filteredPosts.slice(startIndex, endIndex);
  }

  viewPost(postId: number) {
    this.router.navigate(['/post', postId]);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updateCurrentPagePosts();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateCurrentPagePosts();
    }
  }

  checkAdminStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.http.get<{ roles: string[] }>('http://localhost:8181/api/users/me').subscribe({
        next: (user) => {
          this.isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');
        },
        error: (err) => {
          console.error('Error fetching user role:', err);
          this.isAdmin = false;
        }
      });
    } else {
      this.isAdmin = false;
    }
  }

  deletePost(postId: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.error = '';
      this.success = '';
      this.http.delete(`http://localhost:8181/api/posts/${postId}`, { responseType: 'text' }).subscribe({
        next: () => {
          console.log('Post deleted successfully');
          this.success = 'Post deleted successfully.';
          this.fetchPosts(); // Refresh the posts list
          setTimeout(() => {
            this.success = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Error deleting post:', err);
          this.error = 'Failed to delete post.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
