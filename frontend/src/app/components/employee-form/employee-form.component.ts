import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeService, NewEmployee } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="employee-form-container">
      <header class="form-header">
        <h1>{{ isEditMode ? 'Edit Employee' : 'Add New Employee' }}</h1>
        <button class="back-button" (click)="goBack()">
          <span class="icon">⬅️</span>
          Back
        </button>
      </header>

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="employee-form">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input id="firstName" type="text" formControlName="firstName" class="form-control">
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input id="lastName" type="text" formControlName="lastName" class="form-control">
        </div>

        <div class="form-group">
          <label for="birthDate">Birth Date</label>
          <input id="birthDate" type="date" formControlName="birthDate" class="form-control">
        </div>

        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" formControlName="gender" class="form-control">
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="department">Department</label>
          <select id="department" formControlName="department" class="form-control" required>
            <option value="" disabled>Select Department</option>
            <option *ngFor="let dept of departments" [value]="dept.dept_no">{{ dept.dept_name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="title">Title</label>
          <input id="title" type="text" formControlName="title" class="form-control">
        </div>

        <div class="form-group">
          <label for="salary">Salary</label>
          <input id="salary" type="number" formControlName="salary" class="form-control">
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button" [disabled]="!employeeForm.valid">
            {{ isEditMode ? 'Update' : 'Create' }} Employee
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .employee-form-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .form-header h1 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 0;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .back-button:hover {
      background-color: #e9ecef;
    }

    .employee-form {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #2196f3;
    }

    .form-actions {
      margin-top: 2rem;
      text-align: right;
    }

    .submit-button {
      padding: 0.75rem 1.5rem;
      background-color: #2196f3;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .submit-button:hover:not(:disabled) {
      background-color: #1976d2;
    }

    .submit-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  departments = [
    { dept_no: 'd001', dept_name: 'Marketing' },
    { dept_no: 'd002', dept_name: 'Finance' },
    { dept_no: 'd003', dept_name: 'Human Resources' },
    { dept_no: 'd004', dept_name: 'Production' },
    { dept_no: 'd005', dept_name: 'Development' },
    { dept_no: 'd006', dept_name: 'Quality Management' },
    { dept_no: 'd007', dept_name: 'Sales' },
    { dept_no: 'd008', dept_name: 'Research' },
    { dept_no: 'd009', dept_name: 'Customer Service' }
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      department: [null, Validators.required],
      title: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadEmployee(id);
    }
  }

  loadEmployee(id: number) {
    this.employeeService.getEmployeeById(id).subscribe(employee => {
      // Convert date string back to YYYY-MM-DD format for the input
      const birthDate = new Date(employee.birth_date).toISOString().split('T')[0];
      
      // Find the matching department based on department_name
      const dept = this.departments.find(d => d.dept_name === employee.department_name);

      this.employeeForm.patchValue({
        firstName: employee.first_name,
        lastName: employee.last_name,
        birthDate: birthDate,
        gender: employee.gender,
        department: dept?.dept_no || '', // Use the found department's dept_no
        title: employee.title,
        salary: employee.salary
      });
    });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;
      const id = this.route.snapshot.params['id'];

      const employeeData: NewEmployee = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        gender: formData.gender,
        department_no: formData.department,
        title: formData.title,
        salary: formData.salary
      };

      if (this.isEditMode && id) {
        // If editing, update and redirect to profile
        this.employeeService.updateEmployee(id, employeeData).subscribe(() => {
          // Check if we're editing our own profile
          this.employeeService.getEmployeeById(id).subscribe(employee => {
            if (employee.auth0_id) {
              // If it's our profile, go back to profile page
              this.router.navigate(['/profile']);
            } else {
              // If it's another employee, go to dashboard
              this.router.navigate(['/dashboard']);
            }
          });
        });
      } else {
        // If creating new, go to dashboard
        this.employeeService.createEmployee(employeeData).subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      }
    }
  }

  goBack() {
    const id = this.route.snapshot.params['id'];
    if (this.isEditMode && id) {
      // Check if we're editing our own profile
      this.employeeService.getEmployeeById(id).subscribe(employee => {
        if (employee.auth0_id) {
          // If it's our profile, go back to profile page
          this.router.navigate(['/profile']);
        } else {
          // If it's another employee, go to dashboard
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      // If creating new, go to dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
