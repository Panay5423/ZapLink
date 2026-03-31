import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../../cors/services/Search.Service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {

  constructor(private searchService: SearchService, private router: Router) { }

  @Output() toggle = new EventEmitter<void>();

  isDark: boolean = false;
  query = new FormControl('');

  searchResults: any[] = [];
  isSearchDropdownOpen: boolean = false;
  isLoading: boolean = false;

  ngOnInit() {
    this.isDark = localStorage.getItem('theme') === 'dark';
    if (this.isDark) {
      document.body.classList.add('dark');
    }

    this.query.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe({
      next: (value) => {
        if (value && value.trim() !== '') {
          this.onSearch(value);
        } else {
          this.searchResults = [];
          this.isSearchDropdownOpen = false;
        }
      }
    });
  }

  onSearch(searchTerm: string) {
    this.isLoading = true;
    this.isSearchDropdownOpen = true;

    this.searchService.search(searchTerm).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Safely extract array regardless of API wrapper structure
        console.log("search result", res);
        this.searchResults = Array.isArray(res) ? res : (res.data || res.users || [res]);
        if (this.searchResults.length === 1 && !this.searchResults[0]) {
          this.searchResults = []; // Edge case handling
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.searchResults = [];
        console.log(err);
      }
    });
  }

  closeDropdown() {
    setTimeout(() => {
      this.isSearchDropdownOpen = false;
    }, 200);
  }

  selectUser(user: any) {
    console.log("Selected user:", user);
    this.query.setValue('');
    this.isSearchDropdownOpen = false;
    this.router.navigate(['/dashboard', user._id]).then(() => {
      console.log("neviucation done");
    });
    // Handle navigation or user selection logic here

  }

  getProfileUrl(user: any): string {
    const pic = user.profilePicture || user.avatar;
    if (pic) {
      if (pic.startsWith('http')) return pic;

      const baseUrl = environment.BaseAPiURL.endsWith('/') ? environment.BaseAPiURL.slice(0, -1) : environment.BaseAPiURL;

      let path = pic;
      if (!path.includes('uploads/')) {
        path = path.startsWith('/') ? `uploads${path}` : `uploads/${path}`;
      }
      path = path.startsWith('/') ? path : `/${path}`;

      return `${baseUrl}${path}`;
    }
    return `https://ui-avatars.com/api/?name=${user.username || user.name || 'User'}&background=random`;
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}