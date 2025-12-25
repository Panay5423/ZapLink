import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServisec } from '../services/auth.services';
import { login } from '../Model/usermodel';
import { resetEmail } from '../Model/usermodel';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  formData: login = {
    email: '',
    password: '',
  };

  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';
  showForgotModal = false;
  FormData_of_mail: resetEmail =
    {
      email: ''
    }
  isLoading = false;
  mailSent = false;
  show_errorMessage = '';




  constructor(private authService: AuthServisec, private router: Router) { }

  login() {
    this.authService.login(this.formData).subscribe(
      (response: any) => {
        console.log(' Response:', response);

        if (response.success) {

          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));


          this.showSuccessNotification(' Login Successful! Redirecting...');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        }


        this.formData = { email: '', password: '' };
      },
      (error: any) => {
        console.error('Error:', error);

        if (error.error?.message) {
          this.showErrorNotification(error.error.message);
        } else if (error.status === 404) {
          this.showErrorNotification('Wrong email or password!');
        }
        else if (error.status === 500)
        {
          this.showErrorNotification('error 500');
        }
         else {
          this.showErrorNotification('Something went wrong! Try again.');
        }
      }
    );
  }
  forgotPassword() {
    this.showForgotModal = true
  }
  closeForgotModal() {
    this.showForgotModal = false
  }
  sendResetLink() {
    this.isLoading = true;
    this.mailSent = false;
    this.show_errorMessage = '';

    console.log('Reset Data:', this.formData, this.FormData_of_mail);

    this.authService.reset_pass(this.FormData_of_mail).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        this.isLoading = false;

        if (response.success) {
          this.mailSent = true;
          this.show_errorMessage = '';
          console.log('Mail sent successfuly');

        } else {
          this.show_errorMessage = 'Failed to send reset link. Please try again.';
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.isLoading = false;
        this.show_errorMessage = 'Something went wrong. Try again later.';
      }
    });
  }

  showErrorNotification(message: string) {
    this.errorMessage = message;
    this.showError = true;
    setTimeout(() => (this.showError = false), 3000);
  }

  showSuccessNotification(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 2000);
  }


}
