import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../../cors/services/Search.Service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {

  constructor(private searchService: SearchService) { }

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
    // Timeout allows mousedown event on search items to register before dropdown disappears
    setTimeout(() => {
      this.isSearchDropdownOpen = false;
    }, 200);
  }
  
  selectUser(user: any) {
    console.log("Selected user:", user);
    this.query.setValue('');
    this.isSearchDropdownOpen = false;
    // Handle navigation or user selection logic here
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