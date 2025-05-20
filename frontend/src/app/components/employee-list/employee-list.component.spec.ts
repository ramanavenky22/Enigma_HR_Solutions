/**
 * Employee List Component Tests
 * Tests the employee list component functionality and rendering
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeService } from '../../services/employee.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

describe('EmployeeListComponent', () => {
  let component: EmployeeListComponent;
  let fixture: ComponentFixture<EmployeeListComponent>;
  let employeeService: EmployeeService;

  const mockEmployees = {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeListComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
      ],
      providers: [EmployeeService]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees on init', () => {
    spyOn(employeeService, 'getAllEmployees').and.returnValue(of(mockEmployees));
    
    fixture.detectChanges();
    
    expect(component.employees).toEqual(mockEmployees.employees);
    expect(component.totalItems).toBe(mockEmployees.total);
  });

  it('should handle error when loading employees', () => {
    spyOn(employeeService, 'getAllEmployees').and.returnValue(
      throwError(() => new Error('Failed to load employees'))
    );
    spyOn(console, 'error');
    
    fixture.detectChanges();
    
    expect(console.error).toHaveBeenCalled();
    expect(component.employees).toEqual([]);
  });

  it('should apply filter', () => {
    spyOn(employeeService, 'getAllEmployees').and.returnValue(of(mockEmployees));
    
    fixture.detectChanges();
    
    component.applyFilter('John');
    
    expect(employeeService.getAllEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'John' })
    );
  });

  it('should handle page change', () => {
    spyOn(employeeService, 'getAllEmployees').and.returnValue(of(mockEmployees));
    
    fixture.detectChanges();
    
    component.onPageChange({ pageIndex: 1, pageSize: 10 });
    
    expect(employeeService.getAllEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 10 })
    );
  });

  it('should handle sort change', () => {
    spyOn(employeeService, 'getAllEmployees').and.returnValue(of(mockEmployees));
    
    fixture.detectChanges();
    
    component.onSortChange({ active: 'first_name', direction: 'asc' });
    
    expect(employeeService.getAllEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'first_name', sortOrder: 'asc' })
    );
  });

  it('should delete employee', () => {
    spyOn(employeeService, 'deleteEmployee').and.returnValue(of(void 0));
    spyOn(employeeService, 'getAllEmployees').and.returnValue(of(mockEmployees));
    
    fixture.detectChanges();
    
    component.deleteEmployee(1);
    
    expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1);
    expect(employeeService.getAllEmployees).toHaveBeenCalled();
  });
}); 