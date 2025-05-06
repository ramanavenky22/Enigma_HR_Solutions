import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../../services/employee.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

interface Activity {
  icon: string;
  title: string;
  time: string;
}

interface SalaryTrend {
  month: string;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Dashboard stats
  totalEmployees: number = 0;
  departments: string[] = [];
  recentActivities: Activity[] = [];
  
  // Employee list and filters
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedDepartment: string = '';
  selectedTitle: string = '';
  searchTerm: string = '';
  titles: string[] = [];
  private searchSubject = new Subject<string>();

  // Dummy data for testing
  dummyDepartments = ['Engineering', 'Marketing', 'Sales'];
  dummyTitles = ['Senior Engineer', 'Manager', 'Developer', 'Analyst'];

  // Salary trend data
  averageSalary: number = 85000;
  salaryGrowth: number = 5.2;
  minSalary: number = 65000;
  maxSalary: number = 150000;
  unreadNotifications: number = 3;

  salaryTrends: SalaryTrend[] = [
    { month: 'Jan', amount: 82000, percentage: 75 },
    { month: 'Feb', amount: 83000, percentage: 78 },
    { month: 'Mar', amount: 83500, percentage: 80 },
    { month: 'Apr', amount: 84000, percentage: 82 },
    { month: 'May', amount: 85000, percentage: 85 },
    { month: 'Jun', amount: 85500, percentage: 88 }
  ];

  constructor(
    private router: Router,
    private employeeService: EmployeeService
  ) {
    // Set up search debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => this.filterEmployees());
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadEmployees() {
    // Generate dummy employee data
    this.employees = Array.from({ length: 20 }, (_, i) => ({
      emp_no: 10001 + i,
      first_name: `Employee`,
      last_name: `${i + 1}`,
      birth_date: '1990-01-01',
      gender: i % 2 === 0 ? 'M' : 'F',
      hire_date: '2020-01-01',
      department_name: this.dummyDepartments[i % this.dummyDepartments.length],
      title: this.dummyTitles[i % this.dummyTitles.length],
      salary: 80000 + (i * 5000),
      manager_name: 'Jane Smith'
    }));

    // Update stats
    this.totalEmployees = this.employees.length;
    this.departments = this.dummyDepartments;
    this.titles = this.dummyTitles;
    
    // Initialize filtered list
    this.filteredEmployees = [...this.employees];
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.filterEmployees();
  }

  filterEmployees() {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = !this.searchTerm || 
        employee.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = !this.selectedDepartment || 
        employee.department_name === this.selectedDepartment;
      
      const matchesTitle = !this.selectedTitle || 
        employee.title === this.selectedTitle;

      return matchesSearch && matchesDepartment && matchesTitle;
    });
  }

  viewProfile(empNo: number) {
    this.router.navigate(['/profile', empNo]);
  }

  editEmployee(empNo: number) {
    // Navigate to edit page
    this.router.navigate(['/employees', empNo, 'edit']);
  }

  confirmDelete(empNo: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      // Call the employee service to delete
      this.employeeService.deleteEmployee(empNo).subscribe(
        () => {
          // Remove from local lists
          this.employees = this.employees.filter(e => e.emp_no !== empNo);
          this.filterEmployees();
          // Show success message
          alert('Employee deleted successfully');
        },
        error => {
          console.error('Error deleting employee:', error);
          alert('Failed to delete employee. Please try again.');
        }
      );
    }
  }

  loadDashboardData() {
    // Initialize employee data first
    this.loadEmployees();

    // Recent activities
    this.recentActivities = [
      { icon: '👋', title: 'New employee joined', time: '2 hours ago' },
      { icon: '📈', title: 'Performance review completed', time: '1 day ago' },
      { icon: '🎉', title: 'Project milestone achieved', time: '2 days ago' }
    ];

    // Simulated data - replace with actual API calls
    this.totalEmployees = 240;
    this.departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  addEmployee() {
    // Navigate to add employee form
    this.router.navigate(['/employees/new']);
  }

  viewTeam() {
    this.router.navigate(['/team']);
  }

  viewNotifications() {
    this.router.navigate(['/notifications']);
  }
}
