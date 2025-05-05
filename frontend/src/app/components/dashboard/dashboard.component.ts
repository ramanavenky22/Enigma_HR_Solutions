import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments: string[] = [];
  roles: string[] = [];
  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedRole: string = '';
  totalEmployees: number = 0;
  totalDepartments: number = 0;

  constructor(private employeeService: EmployeeService, private router: Router) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
    this.loadRoles();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data;
      this.applyFilters();
      this.totalEmployees = data.length;
    });
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe((data) => {
      this.departments = data;
      this.totalDepartments = data.length;
    });
  }

  loadRoles() {
    this.employeeService.getRoles().subscribe((data) => {
      this.roles = data;
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const matchesSearch = this.searchTerm.trim().length === 0 ||
        fullName.includes(this.searchTerm.trim().toLowerCase());
      const matchesDept = !this.selectedDepartment || emp.department === this.selectedDepartment;
      const matchesRole = !this.selectedRole || (emp.title && emp.title === this.selectedRole);
      return matchesSearch && matchesDept && matchesRole;
    });
  }

  onAddEmployee() {
    // Navigate to add employee form
    this.router.navigate(['/dashboard/add']);
  }

  onView(employee: Employee) {
    // Navigate to view employee details
    this.router.navigate(['/dashboard/view', employee.emp_no]);
  }

  onEdit(employee: Employee) {
    // Navigate to edit employee form
    this.router.navigate(['/dashboard/edit', employee.emp_no]);
  }

  onDelete(employee: Employee) {
    const fullName = `${employee.first_name} ${employee.last_name}`;
    if (confirm(`Are you sure you want to delete ${fullName}?`)) {
      this.employeeService.deleteEmployee(employee.emp_no).subscribe(() => {
        this.loadEmployees();
        this.loadDepartments();
        this.loadRoles();
      });
    }
  }
}

