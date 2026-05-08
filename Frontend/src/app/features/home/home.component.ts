import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StoriesBarComponent } from '../stories/stories-bar/stories-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, StoriesBarComponent],
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
      let hostUrl = environment.BaseAPiURL;
      if (hostUrl.endsWith('/api/')) hostUrl = hostUrl.replace('/api/', '');
      else if (hostUrl.endsWith('/api')) hostUrl = hostUrl.replace('/api', '');
      else if (hostUrl.endsWith('/')) hostUrl = hostUrl.slice(0, -1);

      let path = pic;
      if (!path.includes('uploads/')) {
        path = path.startsWith('/') ? `uploads${path}` : `uploads/${path}`;
      }
      path = path.startsWith('/') ? path : `/${path}`;
      return `${hostUrl}${path}`;
    }
    return `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`;
  }

  getPostImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let hostUrl = environment.BaseAPiURL;
    if (hostUrl.endsWith('/api/')) hostUrl = hostUrl.replace('/api/', '');
    else if (hostUrl.endsWith('/api')) hostUrl = hostUrl.replace('/api', '');
    else if (hostUrl.endsWith('/')) hostUrl = hostUrl.slice(0, -1);

    return `${hostUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  likePost(post: any) {
    if(!post._id) return;
    
    const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;
    const token = localStorage.getItem('zaplink_token') || localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Optimistically update UI
    post.hasLiked = !post.hasLiked;
    post.likesCount = post.hasLiked ? (post.likesCount + 1) : (Math.max(0, post.likesCount - 1));

    this.http.post(`${baseUrl}/posts/${post._id}/like`, {}, { headers }).subscribe({
      next: (res: any) => {
        // We can sync with server if we want, but optimistic is fine
        post.hasLiked = res.hasLiked;
      },
      error: (err) => {
        console.error("Error liking post:", err);
        // Revert optimistic update on error
        post.hasLiked = !post.hasLiked;
        post.likesCount = post.hasLiked ? (post.likesCount + 1) : (Math.max(0, post.likesCount - 1));
      }
    });
  }

  commentPost(post: any) {
    post.showCommentBox = !post.showCommentBox;
    if (post.showCommentBox && !post.commentsLoaded) {
      this.loadComments(post);
    }
  }

  loadComments(post: any) {
    const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;
    const token = localStorage.getItem('zaplink_token') || localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get(`${baseUrl}/posts/${post._id}/comments`, { headers }).subscribe({
      next: (res: any) => {
        post.commentsList = res;
        post.commentsLoaded = true;
      },
      error: (err) => console.error("Error loading comments:", err)
    });
  }

  submitComment(post: any, commentInput: HTMLInputElement) {
    const text = commentInput.value;
    if (!text || text.trim() === '') return;

    const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;
    const token = localStorage.getItem('zaplink_token') || localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post(`${baseUrl}/posts/${post._id}/comment`, { comment: text }, { headers }).subscribe({
      next: (res: any) => {
        if (!post.commentsList) post.commentsList = [];
        post.commentsList.unshift(res.comment); // add to top
        post.commentsCount = (post.commentsCount || 0) + 1;
        commentInput.value = ''; // clear input
      },
      error: (err) => {
        console.error("Error submitting comment:", err);
        alert("Failed to post comment.");
      }
    });
  }
}
