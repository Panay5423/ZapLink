import { Component } from '@angular/core';
import { PostService } from '../../services/post.services';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  constructor(private postService: PostService) { }

    posts: any[] = [];
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  isLoading = true;
  ngOnInit() {
  
  this.postService.getpost().subscribe(
    (response: any) => {
      console.log('User Posts:', response);
      this.posts = response;  
      this.isLoading = false;
      console.log(this.posts);
      console.log( this.user.profilePicture);
      console.log( this.user.bannerPicture);
    },
    (error: any) => {
      this
      console.error('Error fetching posts:', error);
    }
  );
}


}
