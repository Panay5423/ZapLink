import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../cors/services/auth/auth.service';
import { SearchService } from '../../cors/services/search/search.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileData: any = null;
  isLoading = true;
  isOwnProfile = false;
  isEditing = false;
  
  editBio: string = '';
  selectedAvatar: File | null = null;
  selectedBanner: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'me') {
        this.isOwnProfile = false;
        this.loadOtherProfile(id);
      } else {
        this.isOwnProfile = true;
        this.loadOwnProfile();
      }
    });
  }

  loadOwnProfile() {
    this.isLoading = true;
    this.authService.getUser().subscribe({
      next: (res) => {
        this.profileData = res.user;
        this.editBio = this.profileData.bio || '';
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading profile:", err);
        this.isLoading = false;
      }
    });
  }

  loadOtherProfile(id: string) {
    this.isLoading = true;
    this.searchService.GetUserprofile(id).subscribe({
      next: (res) => {
        // searchService returns the profile details directly
        this.profileData = res; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading user profile:", err);
        this.isLoading = false;
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // reset selections if canceled
      this.selectedAvatar = null;
      this.selectedBanner = null;
    }
  }

  onAvatarSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedAvatar = event.target.files[0];
    }
  }

  onBannerSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedBanner = event.target.files[0];
    }
  }

  saveProfile() {
    const formData = new FormData();
    formData.append('bio', this.editBio);
    if (this.selectedAvatar) formData.append('profilePicture', this.selectedAvatar);
    if (this.selectedBanner) formData.append('banner', this.selectedBanner);

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.isEditing = false;
        this.loadOwnProfile(); // reload to get new images
      },
      error: (err) => {
        console.error("Error updating profile", err);
        alert("Failed to update profile");
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

  getBannerUrl(pic: string): string {
    if (!pic) return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000'; // placeholder banner
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

  getPostImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let hostUrl = environment.BaseAPiURL;
    if (hostUrl.endsWith('/api/')) hostUrl = hostUrl.replace('/api/', '');
    else if (hostUrl.endsWith('/api')) hostUrl = hostUrl.replace('/api', '');
    else if (hostUrl.endsWith('/')) hostUrl = hostUrl.slice(0, -1);

    return `${hostUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
