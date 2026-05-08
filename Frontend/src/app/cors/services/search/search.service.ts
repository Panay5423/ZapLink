import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class SearchService {

    constructor(private http: HttpClient) { }
    private baseUrl = environment.BaseAPiURL;
    private get get_token() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    }

    search(query: string): Observable<any> {
        console.log("search service", query)
        return this.http.get(`${this.baseUrl}search/users?query=${query}`)

    }
    GetUserprofile(id: String): Observable<any> {
        console.log("get user profile service", id)
        return this.http.get(`${this.baseUrl}users/${id}`
            , { headers: this.get_token }
        )

    }
}


//action/view_user/:id