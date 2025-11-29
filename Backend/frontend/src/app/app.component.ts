import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  formData =
    {
      username: '',
      FiratName: '',
      Lastname: '',
      Email: '',
      Password: '',
      Date: '',
      gender:'',
      bio:'',
      ProfilePicture:'',


    }


  constructor(private http: HttpClient) { }

  submitForm() {
    this.http.post<any>('http://localhost:3000/api/v2/auth/register', this.formData)
      .subscribe(
        (response) => {
       
          alert('Data send successfully ');

          console.log('Data saved successfully:', response);
          console.log("Your token is =>", response.token)

          localStorage.setItem("token",response.token);

          this.formData.Email = ''; // Form ko reset karein
          this.formData.Password = '';
        },
        (error) => {
          console.error('There was an error saving the data:', error);
          alert('Failed to save data!');
        }
      );
  }
}
