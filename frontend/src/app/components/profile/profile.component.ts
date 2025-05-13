import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { EmployeeService, Employee } from '../../services/employee.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

interface User {
  name: string;
  email: string;
  picture: string;
  sub: string; // auth0_id
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user$: Observable<User>;
  employee$: Observable<Employee | null> = of(null);
  isCurrentUser: boolean = false;
  isHR: boolean = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private employeeService: EmployeeService
  ) {
    this.user$ = this.auth.user$ as Observable<User>;
  }

  ngOnInit() {
    const empId = this.route.snapshot.params['id'];

    // Check HR role for current user
    this.auth.user$.subscribe(user => {
      const roles = user?.['https://hr-portal.com/roles'] || [];
      this.isHR = roles.some((role: string) => role.toLowerCase() === 'hr') || false;
    });

    if (empId) {
      this.employee$ = this.employeeService.getEmployeeById(empId).pipe(
        catchError(() => of(null))
      );
      this.isCurrentUser = false;
    } else {
      // For current user profile
      this.auth.user$.subscribe(user => {
        if (user?.sub) { // sub is the auth0_id
          // Try to find employee by auth0_id
          this.employeeService.getProfileByAuth0Id(user.sub).pipe(
            map(employee => ({ ...employee, auth0_id: user.sub }))
          ).subscribe({
            next: (employee: Employee) => {
              this.employee$ = of({ ...employee, auth0_id: user.sub });
              this.isCurrentUser = true;
            },
            error: (error: Error) => {
              console.error('Error fetching employee profile:', error);
              // If not found, show basic user info
              const currentUserEmployee: Employee = {
                emp_no: 0,
                first_name: user.name?.split(' ')[0] || 'Current',
                last_name: user.name?.split(' ')[1] || 'User',
                birth_date: new Date().toISOString(),
                gender: 'N/A',
                hire_date: new Date().toISOString(),
                department_name: 'N/A',
                dept_no: '',
                title: 'N/A',
                salary: 0,
                manager_name: 'N/A',
                auth0_id: user.sub
              };
              this.employee$ = of(currentUserEmployee);
              this.isCurrentUser = true;
            }
          });
        }
      });
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    // Add timezone offset to prevent date shift
    const d = new Date(date);
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() + userTimezoneOffset).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatSalary(salary: number | undefined): string {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  }
}
