/**
 * Employee Service Tests
 * Tests the employee service functionality and API interactions
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService, Employee, NewEmployee, UpdateEmployee } from './employee.service';
import { environment } from '../../environments/environment';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch employees', () => {
    const mockResponse = {
      employees: [
        {
          emp_no: 1,
          first_name: 'John',
          last_name: 'Doe',
          birth_date: '1990-01-01',
          gender: 'M',
          hire_date: '2020-01-01',
          department_name: 'Engineering',
          dept_no: 'D001',
          title: 'Software Engineer',
          salary: 80000,
          manager_name: 'Jane Smith'
        }
      ],
      total: 1,
      page: 1,
      totalPages: 1
    };

    service.getAllEmployees().subscribe(response => {
      expect(response.employees).toEqual(mockResponse.employees);
      expect(response.total).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/employees`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a new employee', () => {
    const newEmployee: NewEmployee = {
      first_name: 'John',
      last_name: 'Doe',
      birth_date: '1990-01-01',
      gender: 'M',
      department_no: 'D001',
      title: 'Software Engineer',
      salary: 80000
    };

    const mockResponse: Employee = {
      emp_no: 1,
      ...newEmployee,
      hire_date: '2024-03-14',
      department_name: 'Engineering',
      dept_no: 'D001',
      manager_name: 'Jane Smith'
    };

    service.createEmployee(newEmployee).subscribe(employee => {
      expect(employee).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/employees`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update an employee', () => {
    const employeeId = 1;
    const updateData: UpdateEmployee = {
      title: 'Senior Software Engineer',
      salary: 100000
    };

    const mockResponse: Employee = {
      emp_no: 1,
      first_name: 'John',
      last_name: 'Doe',
      birth_date: '1990-01-01',
      gender: 'M',
      hire_date: '2020-01-01',
      department_name: 'Engineering',
      dept_no: 'D001',
      title: 'Senior Software Engineer',
      salary: 100000,
      manager_name: 'Jane Smith'
    };

    service.updateEmployee(employeeId, updateData).subscribe(employee => {
      expect(employee.title).toBe('Senior Software Engineer');
      expect(employee.salary).toBe(100000);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/employees/${employeeId}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should delete an employee', () => {
    const employeeId = 1;

    service.deleteEmployee(employeeId).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/employees/${employeeId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle errors gracefully', () => {
    const errorMessage = 'Server Error';

    service.getAllEmployees().subscribe({
      error: (error: any) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe(errorMessage);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/employees`);
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
}); 