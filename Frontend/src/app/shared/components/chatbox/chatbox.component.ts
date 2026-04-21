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

  constructor(private socialService: SocialService) { }
  ngOnInit() {
    this.loadFollowers();
  }
  loadFollowers() {
    this.socialService.getFollowers().subscribe({
      next: (res) => {
        console.log(res);
        this.followers = res;
        this.filteredFollowers = res;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  onClose() {
    this.close.emit();
  }

  onSearch() {

  }
}
