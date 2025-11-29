import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})


export class SidebarComponent {
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
 ngOnInit() {
  console.log(this.user);
}

}
