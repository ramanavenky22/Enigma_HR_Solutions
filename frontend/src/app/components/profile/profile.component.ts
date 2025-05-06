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
    const dummyEmployee = {
      emp_no: empId || 10001,
      first_name: 'John',
      last_name: 'Doe',
      birth_date: '1990-01-01',
      gender: 'M',
      hire_date: '2020-01-01',
      department_name: 'Engineering',
      title: 'Senior Software Engineer',
      salary: 120000,
      manager_name: 'Jane Smith'
    };

    if (empId) {
      this.employee$ = of(dummyEmployee);
      this.isCurrentUser = false;
    } else {
      // For current user profile
      this.auth.user$.subscribe(user => {
        if (user?.email) {
          const currentUserEmployee = {
            ...dummyEmployee,
            first_name: user.name?.split(' ')[0] || 'Current',
            last_name: user.name?.split(' ')[1] || 'User',
            emp_no: 10002,
            title: 'Product Manager',
            salary: 150000
          };
          this.employee$ = of(currentUserEmployee);
          this.isCurrentUser = true;
        }
      });
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
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
