import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.services';

@Component({
  selector: 'app-profile-view',
  standalone: false,
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css'
})
export class ProfileViewComponent implements OnInit {

  viwerId: string | null = null;
  userData: any = null;
  userData_id: string = '';
  isLoading: boolean = true;

  constructor(private route: ActivatedRoute, private ProjectService: ProjectService) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.viwerId = this.route.snapshot.paramMap.get('id');


      if (this.viwerId) {
        this.isLoading = true;
        this.ProjectService.ViewUser(this.viwerId).subscribe(
          (response: any) => {
            console.log('User Profile Data:', response);
            this.userData = response;
            this.isFollowing = response.isFollowing ;
            
            console.log("Posts", this.userData?.posts);
            console.log("posts", this.userData?.posts.PostImage);
            this.isLoading = false;
          },
          (error: any) => {
            console.error('Error fetching user profile:', error);
            this.isLoading = false;
          }
        );
      }
    });
  }


  getCount(data: any): number {
    if (Array.isArray(data)) {
      return data.length;
    }

    return data ? Number(data) : 0;
  }
  isFollowing: boolean = false;

  toggleFollow() {
    if (!this.userData?._id) return;
    this.isFollowing = true

    this.ProjectService.followUser(this.userData._id).subscribe(
      (response: any) => {
        console.log('Follow/Unfollow response:', response);
          window.location.reload();
      },
      (error: any) => {
        console.error('Error following/unfollowing user:', error);
      }
    );
  }

}