import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component'; // Path check karlena
import { TopbarComponent } from '../../shared/components/topbar/topbar.component'; // Path check karlena

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isCollapsed = false;

  constructor(private router: Router) { }
  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}