import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiURL_UserPost = 'http://localhost:3000/posts/new';
   private apiURL_getPost = 'http://localhost:3000/posts/my-posts';


  constructor(private http: HttpClient) { }

 createPost(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiURL_UserPost, formData, { headers });
  }
  getpost(): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiURL_getPost, { headers });
  }
}
