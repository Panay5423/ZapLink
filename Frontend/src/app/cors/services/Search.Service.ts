import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class SearchService {

    constructor(private http: HttpClient) { }
    private baseUrl = environment.BaseAPiURL;

    search(query: string): Observable<any> {
        console.log("search service", query)
        return this.http.get(`${this.baseUrl}action/search_user?query=${query}`)

    }
}


