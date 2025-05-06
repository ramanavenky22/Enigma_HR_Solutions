import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee.service';

// Using the same API URL as employee service
const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${API_URL}/api/team`;

  constructor(private http: HttpClient) {}

  getTeamMembers(managerId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}`, {
      params: { managerId: managerId.toString() }
    });
  }

  searchTeamMembers(managerId: number, query: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/search`, {
      params: {
        managerId: managerId.toString(),
        q: query
      }
    });
  }

  getTeamSize(managerId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`, {
      params: { managerId: managerId.toString() }
    });
  }
}
