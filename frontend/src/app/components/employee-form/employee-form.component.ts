import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeService, NewEmployee, Employee, UpdateEmployee } from '../../services/employee.service';

interface Department {
  dept_no: string;
  dept_name: string;
}

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

      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading employee data...</p>
      </div>

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="employee-form" [class.loading]="isLoading">
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
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      background: #f0f0f0;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .back-button:hover {
      background: #e0e0e0;
    }

    .employee-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      transition: opacity 0.3s;
    }

    .employee-form.loading {
      opacity: 0.5;
      pointer-events: none;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-control {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-actions {
      grid-column: span 2;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .submit-button {
      padding: 0.5rem 1.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .submit-button:hover {
      background: #0056b3;
    }

    .submit-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  departments: Department[] = [
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

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    const auth0Id = this.route.snapshot.params['auth0_id'];
    
    if (id || auth0Id) {
      this.isEditMode = true;
      this.isLoading = true;
      if (auth0Id) {
        this.loadEmployeeByAuth0Id(auth0Id);
      } else if (id) {
        this.loadEmployeeById(parseInt(id, 10));
      }
    }
  }

  loadEmployeeByAuth0Id(auth0Id: string): void {
    this.employeeService.getProfileByAuth0Id(auth0Id).subscribe({
      next: (employee: Employee) => {
        this.patchEmployeeForm(employee);
        // Store emp_no in route queryParams for later use
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { emp_no: employee.emp_no },
          queryParamsHandling: 'merge'
        });
      },
      error: (error) => {
        console.error('Error loading employee:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadEmployeeById(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee: Employee) => {
        this.patchEmployeeForm(employee);
      },
      error: (error) => {
        console.error('Error loading employee:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  patchEmployeeForm(employee: Employee): void {
    console.log('Received employee data:', employee);

    // Find department number from name if we don't have dept_no
    let departmentNo = employee.dept_no;
    if (!departmentNo && employee.department_name) {
      const dept = this.departments.find(d => d.dept_name === employee.department_name);
      if (dept) {
        departmentNo = dept.dept_no;
      }
    }

    // Format date if it's in ISO format
    const formatDateForInput = (dateStr: string) => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    this.employeeForm.patchValue({
      firstName: employee.first_name,
      lastName: employee.last_name,
      birthDate: formatDateForInput(employee.birth_date),
      gender: employee.gender,
      department: departmentNo,
      title: employee.title,
      salary: employee.salary
    });
    console.log('Form values after patch:', this.employeeForm.value);
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;
      const id = this.route.snapshot.params['id'];
      const auth0Id = this.route.snapshot.params['auth0_id'];

      // Keep the original date string if it's already in YYYY-MM-DD format
      const formatDate = (date: string | undefined) => {
        if (!date) return undefined;
        // If date is already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        // Otherwise, format it
        const d = new Date(date);
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
        return `${adjustedDate.getFullYear()}-${String(adjustedDate.getMonth() + 1).padStart(2, '0')}-${String(adjustedDate.getDate()).padStart(2, '0')}`;
      };

      const employeeData: UpdateEmployee = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formatDate(formData.birthDate),
        gender: formData.gender,
        department: formData.department,
        title: formData.title,
        salary: formData.salary
      };

      if (this.isEditMode) {
        if (auth0Id) {
          // If editing by auth0_id, we already have the emp_no from loading the form
          const empId = this.route.snapshot.queryParams['emp_no'];
          if (empId) {
            this.employeeService.updateEmployee(parseInt(empId, 10), employeeData).subscribe(() => {
              this.router.navigate(['/profile']);
            });
          }
        } else if (id) {
          // If editing by emp_no
          const empId = parseInt(id, 10);
          this.employeeService.updateEmployee(empId, employeeData).subscribe(() => {
            // No need to check auth0_id again, we already know from form loading
            this.router.navigate(['/dashboard']);
          });
        }
      } else {
        // If creating new, go to dashboard
        const newEmployeeData: NewEmployee = {
          first_name: employeeData.first_name || '',
          last_name: employeeData.last_name || '',
          birth_date: employeeData.birth_date || '',
          gender: employeeData.gender || '',
          department_no: employeeData.department || '',
          title: employeeData.title || '',
          salary: employeeData.salary || 0
        };
        this.employeeService.createEmployee(newEmployeeData).subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      }
    }
  }

  goBack(): void {
    const id = this.route.snapshot.params['id'];
    const auth0Id = this.route.snapshot.params['auth0_id'];
    
    if (this.isEditMode) {
      if (auth0Id) {
        // If editing by auth0_id, go back to profile
        this.router.navigate(['/profile']);
      } else if (id) {
        // Check if we're editing our own profile
        const empId = parseInt(id, 10);
        this.employeeService.getEmployeeById(empId).subscribe((employee: Employee) => {
          if (employee?.auth0_id) {
            this.router.navigate(['/profile']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        });
      }
    } else {
      // If creating new, go to dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
