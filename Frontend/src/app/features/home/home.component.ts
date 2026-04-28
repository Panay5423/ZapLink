import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  feedPosts: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadFeed();
  }

  loadFeed() {
    this.isLoading = true;
    const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;
    const token = localStorage.getItem('zaplink_token') || localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get(`${baseUrl}/posts/feed`, { headers }).subscribe({
      next: (res: any) => {
        this.feedPosts = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading feed:", err);
        this.isLoading = false;
      }
    });
  }

  getProfileUrl(user: any): string {
    if (!user) return 'https://ui-avatars.com/api/?name=User&background=random';
    const pic = user.profilePicture || user.avatar;
    if (pic) {
      if (pic.startsWith('http')) return pic;
      const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;
      let path = pic;
      if (!path.includes('uploads/')) {
        path = path.startsWith('/') ? `uploads${path}` : `uploads/${path}`;
      }
      path = path.startsWith('/') ? path : `/${path}`;
      return `${baseUrl}${path}`;
    }
    return `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`;
  }

  getPostImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  likePost(post: any) {
    // Placeholder for like functionality
    console.log("Liked post", post._id);
  }

  commentPost(post: any) {
    // Placeholder for comment functionality
    console.log("Comment on post", post._id);
  }
}
