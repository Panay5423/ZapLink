import { Component } from '@angular/core';
import { AuthServisec } from '../services/auth.services';
import { RouterOutlet } from '@angular/router';
import{ Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {    
  notifications = 3;
   showModal = false;
      searchQuery = '';
  searchResults: any[] = [];
  showDropdown = false;


    user: any = JSON.parse(localStorage.getItem('user') || '{}');

    constructor(  private authService: AuthServisec , private router: Router) {}

    
  onSearchChange() {
    const query = this.searchQuery.trim();
    if (!query) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }
   
    this.authService.search(query).subscribe({
      next: (res: any) => {
        console.log('Search results:', res);
        this.searchResults = res;
        this.showDropdown = res.length > 0;
      },
      error: (err: any) => console.error('Search error:', err)
    });
  }


  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
  goToProfile(userId: string) {
    
this.router.navigate(['/dashboard/profile', userId]);
console.log('Navigating to profile of user ID:', userId);
  }
  hideDropdown() {
  setTimeout(() => {
    this.showDropdown = false;
  }, 200);
}

}
