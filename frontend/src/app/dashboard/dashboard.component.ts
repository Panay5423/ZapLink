import { Component } from '@angular/core';
import { PostComponent } from '../post/post.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ProjectService } from '../services/project.services';
import { Soket } from '../services/socket.service'


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private ProjectService: ProjectService, private WebSoket: Soket) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user')!)
    this.WebSoket.connect(user.id)
    this.ProjectService.getNotification().subscribe(
      (response: any) => {
        console.log(response)


      },
      (error: any) => {
        console.log(error)
      }
    )
  }

}
