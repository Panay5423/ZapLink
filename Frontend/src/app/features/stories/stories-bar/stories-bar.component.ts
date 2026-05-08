import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryService } from '../../../cors/services/story/story.service';
import { AuthService } from '../../../cors/services/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { StoryViewerComponent } from '../story-viewer/story-viewer.component';

@Component({
  selector: 'app-stories-bar',
  standalone: true,
  imports: [CommonModule, StoryViewerComponent],
  templateUrl: './stories-bar.component.html',
  styleUrls: ['./stories-bar.component.css']
})
export class StoriesBarComponent implements OnInit {
  currentUser: any;
  groupedStories: any[] = [];
  
  // Viewer state
  isViewerOpen = false;
  activeStoryGroupIndex = 0;

  constructor(
    private storyService: StoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe(res => {
      this.currentUser = res.user;
    });
    this.loadStories();
  }

  loadStories() {
    this.storyService.getStoriesFeed().subscribe({
      next: (res) => {
        this.groupedStories = res;
      },
      error: (err) => console.error("Error loading stories:", err)
    });
  }

  triggerUpload() {
    const input = document.getElementById('storyUploadInput') as HTMLInputElement;
    if (input) input.click();
  }

  onStorySelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.storyService.addStory(file).subscribe({
        next: () => {
          this.loadStories(); // reload stories to show yours
        },
        error: (err) => {
          console.error("Error uploading story:", err);
          alert("Failed to upload story");
        }
      });
    }
    // clear input
    event.target.value = '';
  }

  openViewer(index: number) {
    this.activeStoryGroupIndex = index;
    this.isViewerOpen = true;
  }

  closeViewer() {
    this.isViewerOpen = false;
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
