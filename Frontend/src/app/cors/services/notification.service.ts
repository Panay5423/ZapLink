import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  message: string;
  from?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root' // Available globally
})
export class NotificationService {
  // Using Angular Signals for reactive state
  private notificationsSignal = signal<AppNotification[]>([]);
  public notifications = this.notificationsSignal.asReadonly();

  constructor() { }

  show(message: string, from?: string, type: AppNotification['type'] = 'info') {
    const id = Math.random().toString(36).substring(2, 11);

    const newNotification: AppNotification = { id, message, from, type, timestamp: new Date() };

    this.notificationsSignal.update(state => [newNotification, ...state]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  remove(id: string) {
    this.notificationsSignal.update(state => state.filter(n => n.id !== id));
  }
}
