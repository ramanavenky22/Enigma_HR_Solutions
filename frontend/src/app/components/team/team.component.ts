import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { EmployeeService, Employee } from '../../services/employee.service';
import { TeamService } from '../../services/team.service';

interface TeamMember {
  emp_no: number;
  name: string;
  title: string;
  department_name: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  filteredMembers: TeamMember[] = [];
  searchQuery: string = '';

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private teamService: TeamService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadTeamMembers();
      } else {
        this.auth.loginWithRedirect();
      }
    });
  }

  loadTeamMembers() {
    // TODO: Get actual managerId from auth service
    const managerId = 110022; // Temporary hardcoded manager ID (Vishwani Minakawa - Marketing)
    this.teamService.getTeamMembers(managerId).subscribe({
      next: (employees: Employee[]) => {
        this.teamMembers = employees.map(emp => ({
          emp_no: emp.emp_no,
          name: `${emp.first_name} ${emp.last_name}`,
          title: emp.title,
          department_name: emp.department_name
        }));
        this.filteredMembers = [...this.teamMembers];
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        // TODO: Add proper error handling
      }
    });
  }

  onSearch() {
    // TODO: Get actual managerId from auth service
    const managerId = 110039; // Temporary hardcoded manager ID (Vishwani Minakawa - Marketing)
    if (this.searchQuery.trim()) {
      this.teamService.searchTeamMembers(managerId, this.searchQuery).subscribe({
        next: (employees: Employee[]) => {
          this.filteredMembers = employees.map(emp => ({
            emp_no: emp.emp_no,
            name: `${emp.first_name} ${emp.last_name}`,
            title: emp.title,
            department_name: emp.department_name
          }));
        },
        error: (error) => {
          console.error('Error searching team members:', error);
          // TODO: Add proper error handling
        }
      });
    } else {
      this.filteredMembers = [...this.teamMembers];
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  viewProfile(empNo: number) {
    this.employeeService.getEmployeeById(empNo).subscribe({
      next: (employee: Employee) => {
        this.router.navigate(['/employees', empNo]);
      },
      error: (error) => {
        console.error('Error fetching employee profile:', error);
        // TODO: Add proper error handling
      }
    });
  }
}
