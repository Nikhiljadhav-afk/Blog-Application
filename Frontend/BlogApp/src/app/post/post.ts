import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
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

interface Comment {
  id: number;
  content: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  postId: number;
  parentId: number;
  replies: Comment[];
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MarkdownModule   // 🔥 REQUIRED
  ],
  templateUrl: './post.html',
  styleUrls: ['./post.css']
})

export class Post implements OnInit {
  post: PostDetail | null = null;
  comments: Comment[] = [];
  likesCount: number = 0;
  morePosts: PostDetail[] = [];
  loading: boolean = true;
  error: string = '';
  canEdit: boolean = false;
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Post component constructor called');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Post component ngOnInit, id:', id);
    if (id) {
      this.fetchPost(+id);
    } else {
      this.error = 'Invalid post ID.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  checkEditPermission() {
    if (!this.post) return;

    const token = localStorage.getItem('authToken');
    console.log('checkEditPermission: token exists:', !!token);
    if (!token) {
      this.canEdit = false;
      console.log('checkEditPermission: no token, canEdit = false');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('checkEditPermission: full payload:', JSON.stringify(payload));
      const currentUserEmail = payload.sub;
      console.log('checkEditPermission: currentUserEmail:', currentUserEmail, 'post.authorName:', this.post.authorName);

      this.canEdit = (this.post.authorName === currentUserEmail) || (payload.role === 'ROLE_ADMIN');
      console.log('checkEditPermission: canEdit =', this.canEdit);
    } catch (e) {
      this.canEdit = false;
      console.log('checkEditPermission: error parsing token, canEdit = false');
    }
  }

  editPost() {
    if (this.post && this.canEdit) {
      this.router.navigate(['/edit-post', this.post.id]);
    }
  }

  fetchPost(id: number) {
    console.log('fetchPost called with id:', id);
    this.http.get<PostDetail>(`http://localhost:8181/api/posts/${id}`).pipe(timeout(15000)).subscribe({
      next: (response) => {
        console.log('fetchPost success', response);
        this.post = response;
        this.checkEditPermission();
        this.loading = false;
        this.cdr.detectChanges();
        this.fetchMorePosts();
        this.fetchComments(id);
        this.fetchLikes(id);
      },
      error: (err) => {
        console.log('fetchPost error', err);
        this.error = 'Failed to load post.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchComments(id: number) {
    console.log('Fetching comments for post:', id);
    this.http.get<Comment[]>(`http://localhost:8181/api/comments/post/${id}`).subscribe({
      next: (response) => {
        console.log('Comments response:', response);
        this.comments = response;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
      }
    });
  }

  fetchLikes(id: number) {
    this.http.get<{ count: number }>(`http://localhost:8181/api/posts/${id}/likes/count`).subscribe({
      next: (response) => {
        this.likesCount = response.count;
      },
      error: (err) => {
        console.error('Error fetching likes:', err);
      }
    });
  }

  fetchMorePosts() {
    this.http.get<{ content: PostDetail[] }>('http://localhost:8181/api/posts').subscribe({
      next: (response) => {
        // Filter out the current post and take first 3
        this.morePosts = response.content.filter(p => p.id !== this.post?.id).slice(0, 3);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching more posts:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  viewPost(postId: number) {
    this.router.navigate(['/post', postId]);
  }
}
