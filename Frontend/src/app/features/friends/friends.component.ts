import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocialService } from '../../cors/services/social/social.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  followers: any[] = [];
  isLoading = true;

  constructor(
    private socialService: SocialService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadFollowers();
  }

  loadFollowers() {
    this.isLoading = true;
    this.socialService.getFollowers().subscribe({
      next: (res) => {
        this.followers = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading followers", err);
        this.isLoading = false;
      }
    });
  }

  removeFollower(id: string) {
    if (confirm("Are you sure you want to remove this follower?")) {
      this.socialService.removeFollower(id).subscribe({
        next: () => {
          this.followers = this.followers.filter(f => f._id !== id);
        },
        error: (err) => console.error("Error removing follower", err)
      });
    }
  }

  blockUser(id: string) {
    if (confirm("Are you sure you want to block this user? They will be removed from your followers.")) {
      this.socialService.blockUser(id).subscribe({
        next: () => {
          this.followers = this.followers.filter(f => f._id !== id);
        },
        error: (err) => console.error("Error blocking user", err)
      });
    }
  }

  chatWithUser(user: any) {
    alert("To chat with " + user.username + ", please open the Messages tab in the sidebar and search for them!");
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
}
