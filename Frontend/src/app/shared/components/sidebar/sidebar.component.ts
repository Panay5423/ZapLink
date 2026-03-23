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
  @Input() collapsed = false; 
  @Output() toggleCollapse = new EventEmitter<void>();
  user: any;
  username: string = "";
  UID: string = "";

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = this.user.username;
    this.UID = this.user.id;
  }


  toggle() {
  this.collapsed = !this.collapsed; // True/False badal dega
    this.toggleCollapse.emit(); // Parent ko bhi bata dega
  }
}