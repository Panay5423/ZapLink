import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() postCreated = new EventEmitter<void>();

  caption = '';
  postImageFile: File | null = null;
  postImagePreview: string | ArrayBuffer | null = null;
  
  isSubmitting = false;
  UID: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.UID = user.id;
  }

  onClose() {
    this.close.emit();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.postImageFile = file;
      const reader = new FileReader();
      reader.onload = e => this.postImagePreview = reader?.result || null;
      reader.readAsDataURL(file);
    }
  }

  submitPost() {
    if (!this.postImageFile) {
      alert("An image is required!");
      return;
    }
    
    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('Caption', this.caption);
    formData.append('PostImage', this.postImageFile);
    // backend now uses req.user.id, but we can still append it if we want
    // formData.append('Posted_by', this.UID);

    const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;
    const token = localStorage.getItem('zaplink_token') || localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post(`${baseUrl}/posts/new`, formData, { headers }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.postCreated.emit();
        this.onClose();
        // Refresh page to show the new post in the feed instantly
        window.location.reload();
      },
      error: (err) => {
        console.error("Error creating post", err);
        this.isSubmitting = false;
        alert(`Failed to create post. ${err.error?.message || err.message}`);
      }
    });
  }
}
