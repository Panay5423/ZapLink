import { Component } from '@angular/core';
import { LoginForm } from '../../../cors/model/user.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../cors/services/auth.services';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) { }

  loginForm: LoginForm = {
    email: "",
    password: ""
  }
  showError = false;
  errorMessage = "";
  submit() {
    console.log(this.loginForm);
    this.auth.login(this.loginForm).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.token) {
          console.log(res.token);
          localStorage.setItem('token', res.token);
          if (res.success) {
            console.log("Login successful");
            console.log("saved token is ", localStorage.getItem('token'));
            this.router.navigate(['dashboard']);

          }
        }
      },
      error: (err: any) => {
        console.log(err);
        this.showNotification(err.error.message);

      }
    });
  }
  showNotification(message: string) {
    this.showError = true;
    this.errorMessage = message;
    setTimeout(() => {
      this.showError = false;
    }, 3000);

  }
}
