
import { Component, ElementRef } from '@angular/core';
import { AuthServisec } from '../services/auth.services';
import { code, User } from '../Model/usermodel';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  showRegisterBox: boolean = true;
  showVerifyBox: boolean = false;
  showCustomizeBox: boolean = false;
  isSubmitting: boolean = false;

  verificationCode: string = '';
  submittedEmail: string = '';

  verificationStatus: 'idle' | 'verifying' | 'verified' | 'failed' = 'idle';


  formData: User = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    date: '',
    gender: '',

    profilePicture: undefined
  };


  customizationData = {
    bio: '',
    profilePicture: null as File | null,
    banner: null as File | null,
    date: '',
    gender: ''
  };

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  errorMessage: string = '';


  profilePicPreview: any = 'https://placehold.co/120x120/E2E8F0/4A5568?text=Profile';
  bannerPreview: any = 'https://placehold.co/550x160/E2E8F0/4A5568?text=Banner';


  constructor(private authService: AuthServisec, private router: Router) { }

  onSubmit() {
    if (!this.formData.email || !this.formData.password) {
      this.showToast('Email and password are required!', 'error');
      return;
    }
    this.isSubmitting = true;
    localStorage.setItem('userEmail', this.formData.email);
    this.authService.register(this.formData).subscribe(
      (response: any) => {
        console.log('Registration successful:', response);
        this.submittedEmail = this.formData.email;
        localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        this.resetForm();
        this.isSubmitting = false;
        this.showRegisterBox = false;
        this.showVerifyBox = true;
      },
      (error: any) => {
        console.error('Registration error:', error);
        this.isSubmitting = false;
        const message = error.error?.message || 'Something went wrong. Please try again!';
        this.showToast(message, 'error');
      }
    );
  }

  onVerify() {
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit code.';
      this.verificationStatus = 'failed';
      setTimeout(() => {
        this.errorMessage = '';
        this.verificationStatus = 'idle';
      }, 2000);
      return;
    }

    this.verificationStatus = 'verifying';
    this.formData.email = localStorage.getItem('userEmail') || '';

    this.authService.verify(this.verificationCode, this.formData.email).subscribe(
      (response: any) => {
        console.log('Verification status', response);


        if (response.success) {
          setTimeout(() => {
            this.verificationStatus = 'verified';
            this.showToast('Verification Successful!', 'success');

            setTimeout(() => {
              this.showVerifyBox = false;
              this.showCustomizeBox = true;
            }, 2000);
          }, 1500);
        } else {

          this.verificationStatus = 'failed';
          this.showToast(response.message || 'Wrong code! Please try again.', 'error');
        }
      },
      (error: any) => {
        console.error('Verification error:', error);
        this.verificationStatus = 'failed';
        const message = error.error?.message || 'Something went wrong. Please try again!';
        console.log(error)
        this.showToast(message, 'error');
      }
    );
  }

  onCustomize() {

    console.log('Customization Data:', this.customizationData);
    const formData = new FormData();
    formData.append('bio', this.customizationData.bio);
    formData.append('gender', this.customizationData.gender);
    formData.append('date', this.customizationData.date);

    if (this.customizationData.profilePicture) {
      formData.append('profilePicture', this.customizationData.profilePicture);
    }
    if (this.customizationData.banner) {
      formData.append('banner', this.customizationData.banner);
    }
  this.authService.customize(formData).subscribe
  ({
   next: (res) => {
      console.log('Server Response:', res);
      this.showToast('Profile updated successfully! Redirecting...', 'success');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    },
    error: (err) => {
      console.error('Error:', err);
      this.showToast('Failed to update profile', 'error');
    }
  }
  )}

  onFileSelected(event: any, type: 'profile' | 'banner') {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'profile') {
        this.customizationData.profilePicture = file;
        this.profilePicPreview = reader.result;
      } else if (type === 'banner') {
        this.customizationData.banner = file;
        this.bannerPreview = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }


  private resetForm() {
    this.formData.username = '';
    this.formData.firstName = '';
    this.formData.lastName = '';
    this.formData.email = '';
    this.formData.password = '';
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}