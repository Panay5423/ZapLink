import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  constructor(private http: HttpClient) { }

  private apiURL_ViewUserProfile = 'http://localhost:3000/action/view_user';
  private apiURL_FollowUser = 'http://localhost:3000/action/follower_following';
                                                            
  ViewUser(_id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    console.log("geting user profile of :", _id);
    return this.http.get<any>(`${this.apiURL_ViewUserProfile}/${_id}`, { headers });
  }
  followUser(_id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    console.log("Following user :", _id);
    return this.http.post<any>(`${this.apiURL_FollowUser}/${_id}`, {}, { headers });
  }

}
