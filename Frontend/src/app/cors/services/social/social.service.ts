import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";


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
        return this.http.post(`${this.baseUrl}follow/${id}`, {}, { headers: this.get_token })
    }
    unfollow(id: string): Observable<any> {
        console.log("unfollow service id", id)
        return this.http.delete(`${this.baseUrl}follow/${id}`, { headers: this.get_token })
    }

    getPendingRequests(): Observable<any> {
        return this.http.get(`${this.baseUrl}notifications/`, { headers: this.get_token });
    }

    acceptFollowRequest(requestId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}follow/accept/${requestId}`, {}, { headers: this.get_token });
    }

    rejectFollowRequest(requestId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}follow/reject/${requestId}`, {}, { headers: this.get_token });
    }
    getfollwers(query: string) {
        console.log("get follwers .............................")
        return this.http.get(`${this.baseUrl}chat/search?query=${query}`, { headers: this.get_token });
    }

    getChatList(): Observable<any> {
        return this.http.get(`${this.baseUrl}chat/list`, { headers: this.get_token });
    }

    getMessages(receiverId: string): Observable<any> {
        return this.http.get(`${this.baseUrl}chat/messages/${receiverId}`, { headers: this.get_token });
    }

    sendMessage(receiverId: string, text: string): Observable<any> {
        return this.http.post(`${this.baseUrl}chat/send`, { receiverId, text }, { headers: this.get_token });
    }

    markAsRead(chatId: string): Observable<any> {
        return this.http.patch(`${this.baseUrl}chat/read/${chatId}`, {}, { headers: this.get_token });
    }

    sendImageMessage(receiverId: string, imageFile: File): Observable<any> {
        const formData = new FormData();
        formData.append('receiverId', receiverId);
        formData.append('image', imageFile);
        return this.http.post(`${this.baseUrl}chat/upload-image`, formData, { headers: this.get_token });
    }

    deleteMessage(messageId: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}chat/messages/${messageId}`, { headers: this.get_token });
    }

    getFollowers(): Observable<any> {
        return this.http.get(`${this.baseUrl}follow/followers`, { headers: this.get_token });
    }

    removeFollower(id: string): Observable<any> {
        return this.http.post(`${this.baseUrl}follow/remove-follower/${id}`, {}, { headers: this.get_token });
    }

    blockUser(id: string): Observable<any> {
        return this.http.post(`${this.baseUrl}follow/block/${id}`, {}, { headers: this.get_token });
    }
}