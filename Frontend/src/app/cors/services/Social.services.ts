import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class SocialService {

    private baseUrl = environment.BaseAPiURL;
    constructor(private http: HttpClient) { }
    get_token = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }

    follow(id: string): Observable<any> {
        console.log("follow service id", id)
        console.log("follow service token", this.get_token.Authorization)
        return this.http.post(`${this.baseUrl}social/follow/${id}`, { headers: this.get_token })
    }
    unfollow(id: string): Observable<any> {
        console.log("unfollow service id", id)
        console.log("unfollow service token", this.get_token.Authorization)
        return this.http.post(`${this.baseUrl}social/unfollow/${id}`, { headers: this.get_token })
    }
    // unfollow(id: string): Observable<any> {
    //     console.log("unfollow service", id)
    //     return this.http.post(`${this.baseUrl}action/unfollow`, { id }, { headers: this.get_token })
    // }
}