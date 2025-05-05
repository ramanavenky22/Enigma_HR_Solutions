import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';

export interface Employee {
  emp_no: number;
  birth_date: string; // ISO date string
  first_name: string;
  last_name: string;
  gender: 'M' | 'F';
  hire_date: string; // ISO date string
  // Optionally, add department, title, salary if needed for views
  department?: string;
  title?: string;
  salary?: number;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/api/employees';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getEmployees(): Observable<Employee[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token =>
        this.http.get<Employee[]>(this.apiUrl, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      )
    );
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token =>
        this.http.post<Employee>(this.apiUrl, employee, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      )
    );
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token =>
        this.http.put<Employee>(`${this.apiUrl}/${employee.emp_no}`, employee, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      )
    );
  }

  deleteEmployee(id: number): Observable<boolean> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token =>
        this.http.delete<boolean>(`${this.apiUrl}/${id}`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      )
    );
  }

  getDepartments(): Observable<string[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token =>
        this.http.get<string[]>(`${this.apiUrl}/departments`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      )
    );
  }

  getRoles(): Observable<string[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token =>
        this.http.get<string[]>(`${this.apiUrl}/roles`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      )
    );
  }
}
