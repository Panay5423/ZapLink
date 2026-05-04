import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { LoginForm } from "../../model/user.model";

@Injectable({ providedIn: 'root' })
export class AuthService {

    private baseUrl = environment.BaseAPiURL;
    constructor(private http: HttpClient) { }
    login(formdata: LoginForm): Observable<any> {
        return this.http.post(`${this.baseUrl}auth/login`, formdata)
    }
    getUser(): Observable<any> {
        console.log("getUser");
        return this.http.get(`${this.baseUrl}auth/getUser`)
    }

    register(formdata: any): Observable<any> {
        return this.http.post(`${this.baseUrl}auth/register`, formdata)
    }
    verify(formdata: any): Observable<any> {
        return this.http.post(`${this.baseUrl}auth/verify`, formdata)
    }
}