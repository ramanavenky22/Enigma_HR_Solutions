import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

// Using the same API URL as other services
const API_URL = 'http://localhost:3000';

export interface Notification {
  id: number;
  icon: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionType?: string;
  actionData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${API_URL}/api/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.updateUnreadCount();
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  markAsRead(id: number): Observable<void> {
    return new Observable(subscriber => {
      this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).subscribe({
        next: () => {
          this.updateUnreadCount();
          subscriber.next();
          subscriber.complete();
        },
        error: (error) => subscriber.error(error)
      });
    });
  }

  private updateUnreadCount() {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .subscribe(response => {
        this.unreadCountSubject.next(response.count);
      });
  }
}
