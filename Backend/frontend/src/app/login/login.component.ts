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
   FormData_of_mail: resetEmail=
   {
      email: ''
   }
 

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
            this.router.navigate(['/ DashBoard']);
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
        } else {
          this.showErrorNotification('Something went wrong! Try again.');
        }
      }
    );
  } 
    forgotPassword(){
     this.showForgotModal=true
    }
    closeForgotModal(){
           this.showForgotModal=false
    }
sendResetLink() {
  console.log('Reset Data:', this.formData,this.FormData_of_mail);
  this.authService.reset_pass(this.FormData_of_mail).subscribe(
    (response: any) => {
      console.log('Response:', response);
      if (response.success) console.log('Password reset mail sent');
    },
    (error: any) => {
      console.error('Error:', error);
    }
  );
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
