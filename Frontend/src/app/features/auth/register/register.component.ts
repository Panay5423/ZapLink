import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../cors/services/auth.services';


@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  step: number = 1;
  profilePreview: string | ArrayBuffer | null = null;
  emial: string = '';
  showVerify: boolean = false;

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

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.registerForm.patchValue({ profilePic: file });

    const reader = new FileReader();
    reader.onload = () => this.profilePreview = reader.result;
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.registerForm.invalid) return;

    console.log('FINAL DATA', this.registerForm.value);
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        console.log(res);
        if (res.success) {
          this.verifyform.patchValue({ verificationemail: res.user.email });
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
