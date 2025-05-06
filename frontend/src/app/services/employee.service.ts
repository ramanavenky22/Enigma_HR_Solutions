import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// TODO: Update with your actual API URL
const API_URL = 'http://localhost:3000';

export interface Employee {
  emp_no: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  hire_date: string;
  department_name: string;
  title: string;
  salary: number;
  manager_name: string;
}

export type NewEmployee = Omit<Employee, 'emp_no' | 'hire_date' | 'manager_name'>;
export type UpdateEmployee = Partial<NewEmployee>;

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${API_URL}/api/employees`;

  constructor(private http: HttpClient) {}

  getAllEmployees(filters?: { title?: string; department?: string }): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, {
      params: filters || {}
    }).pipe(
      map((employees: Employee[]) => employees.map((emp: Employee) => ({
        ...emp,
        // Add any necessary transformations here
        name: `${emp.first_name} ${emp.last_name}`
      })))
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: NewEmployee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: UpdateEmployee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Additional methods for salary trends
  getSalaryTrends(): Observable<{
    averageSalary: number;
    salaryGrowth: number;
    minSalary: number;
    maxSalary: number;
    trends: Array<{ month: string; amount: number; percentage: number }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/salary-trends`);
  }
}
