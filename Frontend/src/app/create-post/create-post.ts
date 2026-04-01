import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

interface CreatePostRequest {
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  posts: any[];
}

@Component({
  selector: 'app-create-post',
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost implements OnInit {
  postForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      published: [true],
      categoryId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.http.get<Category[]>('http://localhost:8181/api/categories').subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  onSubmit() {
    if (this.postForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const postData: CreatePostRequest = this.postForm.value;

      this.http.post('http://localhost:8181/api/posts', postData).subscribe({
        next: (response) => {
          this.success = 'Post created successfully!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
        error: (err) => {
          this.error = 'Failed to create post. Please try again.';
          this.loading = false;
          console.error('Error creating post:', err);
        }
      });
    } else {
      this.postForm.markAllAsTouched();
      this.error = 'Please fill in all required fields correctly.';
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
