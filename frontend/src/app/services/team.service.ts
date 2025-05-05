import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = 'http://localhost:3000/api/team';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = JSON.parse(localStorage.getItem('access_token') || '{}');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getTeam(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }
}
