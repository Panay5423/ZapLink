import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService } from '../../../cors/services/Social.services';


@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent {
  @Output() close = new EventEmitter<void>();
  searchQuery: string = '';

  // Right now just show 'no chat', we can add users list, etc later
  followers: any[] = [];
  filteredFollowers: any[] = [];
  query: string = '';

  constructor(private socialService: SocialService) { }

  ngOnInit() {
  }

  onClose() {
    this.close.emit();
  }

  onSearch() {
    if (this.searchQuery.trim().length > 0) {
      this.socialService.getfollwers(this.searchQuery).subscribe({
        next: (res: any) => {
          console.log(res)
          this.followers = res;
          this.filteredFollowers = res;
        },
        error: (err) => {
          console.error("Search error:", err);
        }
      });
    } else {
      this.followers = [];
      this.filteredFollowers = [];
    }
  }
}
