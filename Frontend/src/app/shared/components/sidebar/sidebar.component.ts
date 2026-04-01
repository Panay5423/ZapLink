import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() openCreatePost = new EventEmitter<void>();
  
  user: any;
  username: string = "";
  UID: string = "";

  constructor(private router: Router) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = this.user.username;
    this.UID = this.user.id;
  }

  isLoggingOut: boolean = false;

  logOut() {
    this.isLoggingOut = true;
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['auth/login']);
      this.isLoggingOut = false;
    }, 1500);
  }

  toggle() {
    this.collapsed = !this.collapsed; // True/False badal dega
    this.toggleCollapse.emit(); // Parent ko bhi bata dega
  }

  onOpenCreatePost() {
    this.openCreatePost.emit();
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
    return `https://ui-avatars.com/api/?name=${user.username || user.name || 'User'}&background=random`;
  }
}