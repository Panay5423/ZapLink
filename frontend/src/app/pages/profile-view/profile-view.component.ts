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
    this.viwerId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {


      if (this.viwerId) {
        this.isLoading = true;
        this.ProjectService.ViewUser(this.viwerId).subscribe(
          (response: any) => {
            console.log('User Profile Data:', response);


            this.userData = response;
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
 

    if (this.viwerId) {
      this.userData_id = this.userData._id;

      this.ProjectService.followUser(this.userData_id).subscribe(
        (response: any) => {
          console.log('Follow/Unfollow response:', response);
          this.isFollowing = !this.isFollowing;
        },
        (error: any) => {
          console.error('Error following/unfollowing user:', error);
        }
      );
    }

  }
}