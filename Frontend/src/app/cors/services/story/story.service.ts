import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class StoryService {
    private baseUrl = environment.BaseAPiURL;

    constructor(private http: HttpClient) { }

    private get get_token() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('zaplink_token') || localStorage.getItem('token')}`
        };
    }

    getStoriesFeed(): Observable<any> {
        return this.http.get(`${this.baseUrl}stories/feed`, { headers: this.get_token });
    }

    addStory(imageFile: File): Observable<any> {
        const formData = new FormData();
        formData.append('storyImage', imageFile);
        return this.http.post(`${this.baseUrl}stories`, formData, { headers: this.get_token });
    }
}
