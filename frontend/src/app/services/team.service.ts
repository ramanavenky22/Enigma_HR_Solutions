import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap } from 'rxjs/operators';
import { Employee } from './employee.service';

// Using the same API URL as employee service
const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${API_URL}/api/team`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getTeamMembers(managerId: number): Observable<Employee[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        return this.http.get<Employee[]>(`${this.apiUrl}`, {
          params: { managerId: managerId.toString() },
          headers: { Authorization: `Bearer ${token}` }
        });
      })
    );
  }

  searchTeamMembers(managerId: number, query: string): Observable<Employee[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        return this.http.get<Employee[]>(`${this.apiUrl}/search`, {
          params: {
            managerId: managerId.toString(),
            q: query
          },
          headers: { Authorization: `Bearer ${token}` }
        });
      })
    );
  }

  getTeamSize(managerId: number): Observable<{ count: number }> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        return this.http.get<{ count: number }>(`${this.apiUrl}/count`, {
          params: { managerId: managerId.toString() },
          headers: { Authorization: `Bearer ${token}` }
        });
      })
    );
  }
}
