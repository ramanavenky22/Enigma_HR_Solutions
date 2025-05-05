import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'http://localhost:3000/profile';

  constructor(private http: HttpClient) {}

  getProfile(empId: number = 10001): Observable<any> {
    // Default empId for demo; in real app, get from auth/user context
    return this.http.get<any>(`${this.apiUrl}?empId=${empId}`);
  }
}
