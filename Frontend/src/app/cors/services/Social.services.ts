import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class SocialService {

    private baseUrl = environment.BaseAPiURL;
    constructor(private http: HttpClient) { }

    private get get_token() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    }

    follow(id: string): Observable<any> {
        console.log("follow service id", id)
        return this.http.post(`${this.baseUrl}social/follow/${id}`, {}, { headers: this.get_token })
    }
    unfollow(id: string): Observable<any> {
        console.log("unfollow service id", id)
        return this.http.post(`${this.baseUrl}social/unfollow/${id}`, {}, { headers: this.get_token })
    }

    getPendingRequests(): Observable<any> {
        return this.http.get(`${this.baseUrl}social/notification`, { headers: this.get_token });
    }

    acceptFollowRequest(requestId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}social/follow/accept/${requestId}`, {}, { headers: this.get_token });
    }

    rejectFollowRequest(requestId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}social/follow/reject/${requestId}`, {}, { headers: this.get_token });
    }
    getfollwers(query: string) {
        return this.http.post(`${this.baseUrl}social/follow/reject/${query}`, {}, { headers: this.get_token });
    }
}