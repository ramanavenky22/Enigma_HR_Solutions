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

  getAllEmployees(filters?: { 
    title?: string; 
    department?: string; 
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<{ 
    employees: Employee[]; 
    total: number; 
    page: number; 
    totalPages: number; 
  }> {
    return this.http.get<any>(this.apiUrl, {
      params: filters || {}
    }).pipe(
      map(response => {
        // Handle the case where response is an array (old format) or object (new format)
        const employees = Array.isArray(response) ? response : response.employees || [];
        
        return {
          employees: employees.map((emp: Employee) => {
            // Add timezone offset to prevent date shift
            const adjustDate = (date: string) => {
              if (!date) return '';
              const d = new Date(date);
              const userTimezoneOffset = d.getTimezoneOffset() * 60000;
              return new Date(d.getTime() + userTimezoneOffset).toLocaleDateString();
            };

            return {
              ...emp,
              birth_date: adjustDate(emp.birth_date),
              hire_date: adjustDate(emp.hire_date),
              salary: emp.salary || 0
            };
          }),
          total: Array.isArray(response) ? response.length : (response.total || 0),
          page: Array.isArray(response) ? 1 : (response.page || 1),
          totalPages: Array.isArray(response) ? 1 : (response.totalPages || 1)
        };
      })
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      map((employee: any) => {
        // Add timezone offset to prevent date shift
        const adjustDate = (date: string | undefined) => {
          if (!date) return 'N/A';
          const d = new Date(date);
          const userTimezoneOffset = d.getTimezoneOffset() * 60000;
          return new Date(d.getTime() + userTimezoneOffset).toLocaleDateString();
        };

        return {
          ...employee,
          department_name: employee.department_name || 'No Department Assigned',
          dept_no: employee.dept_no,
          birth_date: adjustDate(employee.birth_date),
          hire_date: adjustDate(employee.hire_date),
          salary: employee.salary || 0
        } as Employee;
      })
    );
  }

  getProfileByAuth0Id(auth0Id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/profile/${auth0Id}`).pipe(
      map((employee: any) => ({
        ...employee,
        department_name: employee.department_name || 'No Department Assigned',
        dept_no: employee.dept_no || '',
        // Keep raw date format for forms
        birth_date: employee.birth_date || '',
        hire_date: employee.hire_date || '',
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
