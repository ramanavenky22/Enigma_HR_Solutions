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
  dept_no: string;
  title: string;
  salary: number;
  manager_name: string;
  auth0_id?: string;
}

export interface NewEmployee {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  department_no: string;
  title: string;
  salary: number;
}

export interface UpdateEmployee {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  gender?: string;
  department?: string;
  title?: string;
  salary?: number;
}

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
        // Format dates for display
        birth_date: new Date(emp.birth_date).toLocaleDateString(),
        hire_date: new Date(emp.hire_date).toLocaleDateString(),
        // Format salary
        salary: emp.salary || 0
      })))
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      map((employee: any) => ({
        ...employee,
        department_name: employee.department_name || 'No Department Assigned',
        dept_no: employee.dept_no,
        birth_date: employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : 'N/A',
        hire_date: employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A',
        salary: employee.salary || 0
      }) as Employee)
    );
  }

  getProfileByAuth0Id(auth0Id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/profile/${auth0Id}`).pipe(
      map((employee: any) => ({
        ...employee,
        department_name: employee.department_name || 'No Department Assigned',
        dept_no: employee.dept_no || '',
        birth_date: employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : 'N/A',
        hire_date: employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A',
        salary: employee.salary || 0
      }) as Employee)
    );
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

  // Statistics methods
  getEmployeeStats(): Observable<{
    totalEmployees: number;
    departmentDistribution: Array<{ dept_name: string; count: number }>;
    genderDistribution: { male_count: number; female_count: number };
    salaryStatistics: { average: number; minimum: number; maximum: number };
    titleDistribution: Array<{ title: string; count: number }>;
    hiringTrends: Array<{ year: number; month: number; count: number }>;
  }> {
    return this.http.get<any>(`${API_URL}/api/statistics/stats`);
  }

  getSalaryTrends(): Observable<Array<{
    year: number;
    month: number;
    average_salary: number;
    min_salary: number;
    max_salary: number;
  }>> {
    return this.http.get<any>(`${API_URL}/api/statistics/salary-trends`);
  }

  getDepartmentGrowth(): Observable<Array<{
    dept_name: string;
    new_hires: number;
    total_employees: number;
    growth_rate: number;
  }>> {
    return this.http.get<any>(`${API_URL}/api/statistics/department-growth`);
  }
}
