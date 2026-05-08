import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-story-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.css']
})
export class StoryViewerComponent implements OnInit, OnDestroy {
  @Input() storyGroups: any[] = [];
  @Input() initialGroupIndex: number = 0;
  @Output() closeViewer = new EventEmitter<void>();

  currentGroupIndex: number = 0;
  currentStoryIndex: number = 0;

  progressInterval: any;
  progressValue: number = 0; // 0 to 100

  ngOnInit() {
    this.currentGroupIndex = this.initialGroupIndex;
    this.startStory();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  getCurrentGroup() {
    return this.storyGroups[this.currentGroupIndex];
  }

  getCurrentStory() {
    const group = this.getCurrentGroup();
    if (group && group.stories) {
      return group.stories[this.currentStoryIndex];
    }
    return null;
  }

  startStory() {
    this.clearTimer();
    this.progressValue = 0;
    
    // 5 seconds per story = 50 intervals of 100ms
    this.progressInterval = setInterval(() => {
      this.progressValue += 2; // +2% every 100ms
      if (this.progressValue >= 100) {
        this.nextStory();
      }
    }, 100);
  }

  clearTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  nextStory() {
    const group = this.getCurrentGroup();
    if (this.currentStoryIndex < group.stories.length - 1) {
      this.currentStoryIndex++;
      this.startStory();
    } else {
      this.nextGroup();
    }
  }

  prevStory() {
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.startStory();
    } else {
      this.prevGroup();
    }
  }

  nextGroup() {
    if (this.currentGroupIndex < this.storyGroups.length - 1) {
      this.currentGroupIndex++;
      this.currentStoryIndex = 0;
      this.startStory();
    } else {
      this.close();
    }
  }

  prevGroup() {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      const group = this.getCurrentGroup();
      this.currentStoryIndex = group.stories.length - 1; // go to last story of prev group
      this.startStory();
    }
  }

  close() {
    this.clearTimer();
    this.closeViewer.emit();
  }

  getStoryImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    let hostUrl = environment.BaseAPiURL;
    if (hostUrl.endsWith('/api/')) hostUrl = hostUrl.replace('/api/', '');
    else if (hostUrl.endsWith('/api')) hostUrl = hostUrl.replace('/api', '');
    else if (hostUrl.endsWith('/')) hostUrl = hostUrl.slice(0, -1);

    return `${hostUrl}${path.startsWith('/') ? '' : '/'}${path}`;
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
