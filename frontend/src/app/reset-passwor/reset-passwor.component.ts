import { Component, OnInit } from '@angular/core';
import { ActivatedRoute ,  Router} from '@angular/router';
import { Token_password } from '../Model/usermodel';
import { AuthServisec } from '../services/auth.services';
@Component({
  selector: 'app-reset-passwor',
  standalone: false,
  templateUrl: './reset-passwor.component.html',
  styleUrls: ['./reset-passwor.component.css']
})
export class ResetPassworComponent implements OnInit {

  formData: Token_password = {
    token: '',
    NewPassword: ''
  };

  token: string = '';
  password: string = '';
  confirmPassword: string = '';

  showPassword: boolean = false;
  showConfirm: boolean = false;
    successMsg: string = '';
  errorMsg: string = '';
  buttonDisabled: boolean = false;
  showNotification: boolean = false;


  constructor(private routs: ActivatedRoute, private authService: AuthServisec,  private router: Router) { }

  ngOnInit() {
    this.token = this.routs.snapshot.paramMap.get('token')!;
     this.formData.token = this.token;
    console.log('Token received:', this.formData.token);
   
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }



reset() {
  if (this.password !== this.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  this.formData.NewPassword = this.password;
  this.authService.fortagtt_pass(this.formData).subscribe(
    (response: any) => {
      console.log('Response:', response.success);
      if (response.success) {
        this.errorMsg = '';
        this.buttonDisabled = true;
 

        this.showNotification = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

       
        setTimeout(() => {
          this.showNotification = false;
        }, 3000);

      } else {
        this.errorMsg = response.message || 'Something went wrong!';
      }
    },
    (error: any) => {
      console.error('Error:', error);
      this.errorMsg = 'Server error. Try again.';
    }
  );
}


}