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
  emial: string = '';
  showVerify: boolean = false;
  isDarkMode: boolean = false;

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
      address: [''],


      isPrivate: [false],
      terms: [false, Validators.requiredTrue],
      profilePic: [null]
    });

    this.verifyform = this.fb.group({
      verificationCode: ['', Validators.required],
      verificationemail: [this.emial || '', Validators.required]
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
    console.log("fucntion run")
    if (this.registerForm.invalid) {
      console.log("somehting went wrong ")
    };

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

    console.log('FINAL DATA', formValue);
    this.authService.register(formData).subscribe({
      next: (res) => {
        console.log("responce.........", res);
        if (res.success) {
          this.verifyform.patchValue({ verificationemail: res.user.email });
          console.log("token", res.token);
          localStorage.setItem('token', res.token);
          this.step = 4;

        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  verify() {
    console.log(this.verifyform.value);
    this.authService.verify(this.verifyform.value).subscribe({
      next: (res) => {
        console.log(res);
        if (res.success) {
          this.showVerify = true;
          this.step = 5;

        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}
