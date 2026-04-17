import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../cors/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './notification.component.css',
  templateUrl: './notification.component.html',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(120%)', opacity: 0 }),
        animate('350ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(120%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
