import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../cors/services/auth/auth.service';
import { RouterLink } from "@angular/router";
import { Router } from "@angular/router";


@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  step: number = 1;
  profilePreview: string | ArrayBuffer | null = null;
  email: string = '';
  showVerify: boolean = false;
  isDarkMode: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  registerForm: FormGroup;
  verifyform: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required, Validators.minLength(6)]],
      bio: [''],
      dob: ['', Validators.required],
      phone: ['', Validators.required],



      isPrivate: [false],
      terms: [false, Validators.requiredTrue],
      profilePic: [null]
    });

    this.verifyform = this.fb.group({
      verificationCode: ['', Validators.required],
      verificationemail: [this.email || '', Validators.required]
    });
  }

  next() {
    if (this.step < 3) this.step++;
  }

  back() {
    if (this.step > 1) this.step--;
  }

  goToStep(newStep: number) {
    if (this.step < 4 && newStep >= 1 && newStep <= 3) {
      this.step = newStep;
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.registerForm.patchValue({ profilePic: file });

    const reader = new FileReader();
    reader.onload = () => this.profilePreview = reader.result;
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.showError = true;
      setTimeout(() => this.showError = false, 3000);
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const formValue = this.registerForm.value;
    const formData = new FormData();

    Object.keys(formValue).forEach(key => {
      if (key !== 'profilePic' && formValue[key] !== null && formValue[key] !== undefined) {
        formData.append(key, formValue[key]);
      }
    });

    if (formValue.profilePic) {
      formData.append('profilePicture', formValue.profilePic);
    }


    this.authService.register(formData).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.success) {
          this.verifyform.patchValue({ verificationemail: res.user.email });

          localStorage.setItem('token', res.token);
          this.step = 4;

        }
      },
      error: (err) => {
        this.isLoading = false;

        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        this.showError = true;

        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    })
  }

  verify() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.authService.verify(this.verifyform.value).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.success) {
          this.showVerify = true;
          this.step = 5;

        }
      },
      error: (err) => {
        this.isLoading = false;

        this.errorMessage = err.error?.message || 'Verification failed. Please try again.';
        this.showError = true;
        setTimeout(() => this.showError = false, 3000);
      }
    })
  }
}
