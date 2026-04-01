import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

interface PostDetail {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
  categoryId: number;
  authorId: number;
  authorName: string;
}

interface UpdatePostRequest {
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
  categoryId: number;
}

@Component({
  selector: 'app-edit-post',
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.css',
})
export class EditPost implements OnInit {
  postForm: FormGroup;
  post: PostDetail | null = null;
  loading: boolean = true;
  saving: boolean = false;
  error: string = '';
  success: string = '';
  canEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      published: [true],
      categoryId: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPost(+id);
    } else {
      this.error = 'Invalid post ID.';
      this.loading = false;
    }
  }

  loadPost(id: number) {
    console.log('Edit post - Loading post with id:', id);
    this.http.get<PostDetail>(`http://localhost:8181/api/posts/${id}`).subscribe({
      next: (response) => {
        console.log('Edit post - Post loaded:', response);
        this.post = response;
        this.checkEditPermission();
        this.populateForm();
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Edit post - Loading set to false');
      },
      error: (err) => {
        console.error('Edit post - Error loading post:', err);
        this.error = 'Failed to load post.';
        this.loading = false;
      }
    });
  }

  checkEditPermission() {
    // Get current user info from localStorage or token
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.canEdit = false;
      return;
    }

    // Decode token to get user info (simplified - in real app use proper JWT decoding)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Edit post - Token payload:', payload);
      const currentUserEmail = payload.sub;
      const userRole = payload.role || 'USER';
      console.log('Edit post - Current user email:', currentUserEmail);
      console.log('Edit post - Post author name:', this.post?.authorName);
      console.log('Edit post - User role:', userRole);

      // Allow edit if user is the author or admin
      this.canEdit = (this.post?.authorName.toLowerCase() === currentUserEmail.split('@')[0].toLowerCase()) || (userRole === 'ROLE_ADMIN');
      console.log('Edit post - Can edit:', this.canEdit);
    } catch (e) {
      console.error('Error parsing token in edit post:', e);
      this.canEdit = false;
    }

    if (!this.canEdit) {
      this.error = 'You do not have permission to edit this post.';
    }
  }

  populateForm() {
    if (this.post) {
      this.postForm.patchValue({
        title: this.post.title,
        content: this.post.content,
        imageUrl: this.post.imageUrl,
        published: this.post.published,
        categoryId: this.post.categoryId
      });
    }
  }

  onSubmit() {
    if (this.postForm.valid && this.post && this.canEdit) {
      this.saving = true;
      this.error = '';
      this.success = '';

      const updateData: UpdatePostRequest = this.postForm.value;

      this.http.put(`http://localhost:8181/api/posts/${this.post.id}`, updateData).subscribe({
        next: (response) => {
          this.success = 'Post updated successfully!';
          this.saving = false;
          setTimeout(() => {
            this.router.navigate(['/post', this.post!.id]);
          }, 2000);
        },
        error: (err) => {
          this.error = 'Failed to update post. Please try again.';
          this.saving = false;
          console.error('Error updating post:', err);
        }
      });
    } else if (!this.canEdit) {
      this.error = 'You do not have permission to edit this post.';
    } else {
      this.postForm.markAllAsTouched();
      this.error = 'Please fill in all required fields correctly.';
    }
  }

  goBack() {
    if (this.post) {
      this.router.navigate(['/post', this.post.id]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
