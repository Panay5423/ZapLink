import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false; // By default full width
  @Output() toggleCollapse = new EventEmitter<void>();


  toggle() {
    this.collapsed = !this.collapsed; // True/False badal dega
    this.toggleCollapse.emit(); // Parent ko bhi bata dega
  }
}