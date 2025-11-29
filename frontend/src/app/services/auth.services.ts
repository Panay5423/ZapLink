import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { code } from '../Model/usermodel';


@Injectable({
  providedIn: 'root'
})

export class AuthServisec {

  private apiURL_register = 'http://localhost:3000/user/register';
  private apiURL_verify = 'http://localhost:3000/user/verify';
  private apiURL_login = 'http://localhost:3000/user/login';
  private apiUrl_customize = 'http://localhost:3000/user/customize';
  private apiUrl_reset_password_req = 'http://localhost:3000/user/resetpassword'
  private apiUrl_reset_password = 'http://localhost:3000/user/resetpasswordData'
  private apiURL_search_user = 'http://localhost:3000/action/search_user';
  private apiURL_verify_token = 'http://localhost:3000/user/verify';

  constructor(private http: HttpClient) { }

  register(user: any) {
    return this.http.post<any>(this.apiURL_register, user)
  }

  verify(code: string, email: string) {
    console.log("Sending code:", code, "Email:", email);
    return this.http.post<any>(this.apiURL_verify, { code, email });
  }
  reset_pass(email: any) {
    console.log(email);
    return this.http.post<any>(this.apiUrl_reset_password_req, email);
  }
  fortagtt_pass(formData: any) {
    console.log(formData);
    return this.http.post<any>(this.apiUrl_reset_password, formData);
  }
  login(login: any) {
    return this.http.post<any>(this.apiURL_login, login)
  }
  search(query: string) {
    console.log("Searching for:", query);
    return this.http.get<any>(`${this.apiURL_search_user}?q=${query}`);
  }
  customize(formData: FormData) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    console.log("this is token ", token, "this is header", headers)

    return this.http.patch(this.apiUrl_customize, formData, { headers });
  }
  verifyToken() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any>(this.apiURL_verify_token, { headers });
  }
}