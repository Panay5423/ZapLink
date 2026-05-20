import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { SearchService } from '../../cors/services/search/search.service';
import { CreatePostComponent } from '../../shared/components/create-post/create-post.component';
import { ChatboxComponent } from '../../shared/components/chatbox/chatbox.component';
import { ActivatedRoute } from '@angular/router';
import { __param } from 'tslib';
import { environment } from '../../../environments/environment';
import { SocialService } from '../../cors/services/social/social.service';
import { SocketService } from '../../cors/services/socket/socket.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent, CreatePostComponent, ChatboxComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isCollapsed = false;
  view_user: any;
  loggedInUserId: string = '';
  showCreatePostModal = false;
  showChatbox = false;

  toggleCreatePostModal() {
    this.showCreatePostModal = !this.showCreatePostModal;
  }

  toggleChatbox() {
    this.showChatbox = !this.showChatbox;
  }

  constructor(private router: Router, private searchService: SearchService, private route: ActivatedRoute, private socialService: SocialService, private socketService: SocketService) { }
  ngOnInit() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.loggedInUserId = user.id || user._id;
      } catch (e: any) { }
    }

    if (!token) {
      this.router.navigate(['/login']);
    }
    this.route.params.subscribe(param => {
      const id = param['id'];
      if (id) {
        console.log("fucntion call ")
        this.loadUser(id);
      }
      else {
        console.log("no id found");

      }

      this.socketService.SocketConnetion(this.loggedInUserId);

    })

  }
  loadUser(id: string) {
    this.searchService.GetUserprofile(id).subscribe({
      next: (res) => {
        console.log(" function call on URL ");
        console.log("user profile .......")
        console.log(res);
        this.view_user = res.user || res;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  isOwnProfile(): boolean {
    if (!this.view_user || !this.loggedInUserId) return false;


    const viewId = String(this.view_user._id || this.view_user.id || '');
    const myId = String(this.loggedInUserId || '');
    return viewId !== '' && viewId === myId;
  }

  followUser() {
    if (!this.view_user) return;
    const id = String(this.view_user.id || this.view_user._id);
    this.socialService.follow(id).subscribe({
      next: (res) => {
        console.log("follow response", res);
        this.view_user.isFollowing = true;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  isProfileMenuOpen = false;

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !targetElement.closest('.more-options-container')) {
      this.isProfileMenuOpen = false;
    }
  }

  unfollowUser() {
    console.log("Unfollow initiated");
    const id = String(this.view_user.id || this.view_user._id);
    this.socialService.unfollow(id).subscribe({
      next: (res) => {
        console.log("unfollow response", res);
        this.view_user.isFollowing = false;
        this.isProfileMenuOpen = false;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  blockUser() {
    console.log("User blocked");
    this.isProfileMenuOpen = false;
  }

  reportUser() {
    console.log("User reported");
    this.isProfileMenuOpen = false;
  }
  resresetDashboard() {
    this.view_user = undefined;
  }
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
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
    return `https://ui-avatars.com/api/?name=${user.username || user.name || 'User'}&background=random`;
  }
}
