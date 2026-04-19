import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onClose() {
    this.close.emit();
  }

  onSearch() {
    // Basic search functionality placeholder
  }
}
