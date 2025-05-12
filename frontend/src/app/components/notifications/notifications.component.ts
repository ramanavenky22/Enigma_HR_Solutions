import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  filters: string[] = ['All', 'Unread', 'Read'];
  currentFilter: string = 'All';
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notifications = [
      {
        id: 1,
        icon: '🔔',
        message: 'Welcome to the HR Portal! Stay tuned for updates.',
        time: '2025-05-12T13:35:04-07:00',
        read: false
      },
      {
        id: 2,
        icon: '📢',
        message: 'Your profile was updated successfully.',
        time: '2025-05-12T13:30:00-07:00',
        read: true
      },
      {
        id: 3,
        icon: '✅',
        message: 'You have a new onboarding task.',
        time: '2025-05-12T13:00:00-07:00',
        read: false
      },
      {
        id: 4,
        icon: '🚨',
        message: 'Urgent: Please update your emergency contact information.',
        time: '2025-05-12T12:45:00-07:00',
        read: true
      },
      {
        id: 5,
        icon: '🎉',
        message: 'Congratulations on your 2-year work anniversary!',
        time: '2025-05-11T09:00:00-07:00',
        read: false
      }
    ];
    this.applyFilter();
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    switch (this.currentFilter) {
      case 'Unread':
        this.filteredNotifications = this.notifications.filter(n => !n.read);
        break;
      case 'Read':
        this.filteredNotifications = this.notifications.filter(n => n.read);
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  markAsRead(id: number) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      this.notificationService.markAsRead(id).subscribe(() => {
        notification.read = true;
        this.applyFilter();
      });
    }
  }

  handleAction(notification: Notification) {
    switch (notification.actionType) {
      case 'profile':
        this.router.navigate(['/profile', notification.actionData.employeeId]);
        break;
      case 'report':
        this.router.navigate(['/reports', notification.actionData.reportId]);
        break;
      default:
        console.log('No action handler for:', notification.actionType);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
