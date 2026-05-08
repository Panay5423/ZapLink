import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../../cors/services/search/search.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../cors/services/social/Notification-services/notification.service';
import { SocialService } from '../../../cors/services/social/social.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {

  constructor(
    private searchService: SearchService,
    private router: Router,
    public notificationService: NotificationService,
    private socialService: SocialService
  ) { }

  @Output() toggle = new EventEmitter<void>();
  @Output() openCreatePost = new EventEmitter<void>();

  onAddPost() {
    this.openCreatePost.emit();
  }

  isDark: boolean = false;
  query = new FormControl('');

  searchResults: any[] = [];
  isSearchDropdownOpen: boolean = false;
  isLoading: boolean = false;

  isNotificationDropdownOpen: boolean = false;
  pendingRequests: any[] = [];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !targetElement.closest('.notification-container')) {
      this.isNotificationDropdownOpen = false;
    }
  }

  toggleNotificationDropdown() {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    if (this.isNotificationDropdownOpen) {
      this.fetchPendingRequests();
    }
  }

  fetchPendingRequests() {
    this.socialService.getPendingRequests().subscribe({
      next: (res: any) => {
        this.pendingRequests = res.Notification || [];
        
        if (res.ActivityNotifications && res.ActivityNotifications.length > 0) {
          const mappedHistory = res.ActivityNotifications.map((notif: any) => ({
            id: notif._id,
            message: notif.message,
            from: notif.sender, // Pass the full populated sender object
            type: 'info',
            timestamp: new Date(notif.createdAt)
          }));
          this.notificationService.setHistory(mappedHistory);
        }
      },
      error: (err) => {
        console.error("Error fetching notifications", err);
      }
    });
  }

  acceptRequest(request: any) {
    this.socialService.acceptFollowRequest(request._id).subscribe({
      next: (res) => {
        this.notificationService.show('Follow request accepted', undefined, 'success');
        this.pendingRequests = this.pendingRequests.filter(req => req._id !== request._id);
      },
      error: (err) => {
        console.error("Error accepting request", err);
        this.notificationService.show('Failed to accept request', undefined, 'error');
      }
    });
  }

  rejectRequest(request: any) {
    this.socialService.rejectFollowRequest(request._id).subscribe({
      next: (res) => {
        this.notificationService.show('Follow request rejected', undefined, 'info');
        this.pendingRequests = this.pendingRequests.filter(req => req._id !== request._id);
      },
      error: (err) => {
        console.error("Error rejecting request", err);
        this.notificationService.show('Failed to reject request', undefined, 'error');
      }
    });
  }

  ngOnInit() {
    this.fetchPendingRequests(); // Fetch notifications on load to populate history

    this.isDark = localStorage.getItem('theme') === 'dark';
    if (this.isDark) {
      document.body.classList.add('dark');
    }

    this.query.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe({
      next: (value) => {
        if (value && value.trim() !== '') {
          this.onSearch(value);
        } else {
          this.searchResults = [];
          this.isSearchDropdownOpen = false;
        }
      }
    });
  }

  onSearch(searchTerm: string) {
    this.isLoading = true;
    this.isSearchDropdownOpen = true;

    this.searchService.search(searchTerm).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Safely extract array regardless of API wrapper structure
        console.log("search result", res);
        this.searchResults = Array.isArray(res) ? res : (res.data || res.users || [res]);
        if (this.searchResults.length === 1 && !this.searchResults[0]) {
          this.searchResults = []; // Edge case handling
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.searchResults = [];
        console.log(err);
      }
    });
  }

  closeDropdown() {
    setTimeout(() => {
      this.isSearchDropdownOpen = false;
    }, 200);
  }

  selectUser(user: any) {
    console.log("Selected user:", user);
    this.query.setValue('');
    this.isSearchDropdownOpen = false;
    this.router.navigate(['/dashboard', user._id]).then(() => {
      console.log("neviucation done");
    });
  }

  getProfileUrl(user: any): string {
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

  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log("dark theme selected")
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log("light theme selected")
    }
  }
}