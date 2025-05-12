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

interface EmployeeStats {
  totalEmployees: number;
  departmentDistribution: Array<{ dept_name: string; count: number }>;
  genderDistribution: { male_count: number; female_count: number };
  salaryStatistics: { average: number; minimum: number; maximum: number };
  titleDistribution: Array<{ title: string; count: number }>;
  hiringTrends: Array<{ year: number; month: number; count: number }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Dummy notifications for dashboard
  notifications = [
    {
      id: 1,
      icon: '🔔',
      message: 'Welcome to the HR Dashboard! Stay tuned for important updates.',
      time: '2025-05-12T13:35:04-07:00',
      read: false
    },
    {
      id: 2,
      icon: '📢',
      message: 'Your profile was updated successfully.',
      time: '2025-05-12T13:30:00-07:00',
      read: true
    },
    {
      id: 3,
      icon: '✅',
      message: 'You have been assigned a new onboarding task.',
      time: '2025-05-12T13:00:00-07:00',
      read: false
    },
    {
      id: 4,
      icon: '🚨',
      message: 'Urgent: Please update your emergency contact information.',
      time: '2025-05-12T12:45:00-07:00',
      read: true
    },
    {
      id: 5,
      icon: '🎉',
      message: 'Congratulations on your 2-year work anniversary!',
      time: '2025-05-11T09:00:00-07:00',
      read: false
    },
    {
      id: 6,
      icon: '💼',
      message: 'HR Policy update: Please review the new remote work guidelines.',
      time: '2025-05-10T16:20:00-07:00',
      read: true
    },
    {
      id: 7,
      icon: '📝',
      message: 'Performance review period starts next week.',
      time: '2025-05-09T10:30:00-07:00',
      read: false
    },
    {
      id: 8,
      icon: '🏆',
      message: 'You have been nominated for Employee of the Month!',
      time: '2025-05-08T14:15:00-07:00',
      read: true
    },
    {
      id: 9,
      icon: '📅',
      message: 'Upcoming holiday: Office closed on May 20th.',
      time: '2025-05-07T08:00:00-07:00',
      read: false
    },
    {
      id: 10,
      icon: '🔗',
      message: 'New resources added to the HR portal. Check them out!',
      time: '2025-05-06T17:45:00-07:00',
      read: true
    }
  ];

  // Update unreadNotifications count based on dummy notifications
  ngOnInit() {
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
    this.loadDashboardData();
    this.loadEmployees();
    this.loadStatistics();
  }
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
  isLoading: boolean = false;
  private searchSubject = new Subject<string>();

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Statistics data
  averageSalary: number = 0;
  salaryGrowth: number = 0;
  minSalary: number = 0;
  maxSalary: number = 0;
  unreadNotifications: number = 0;
  salaryTrends: SalaryTrend[] = [];
  genderDistribution: { male_count: number; female_count: number } = { male_count: 0, female_count: 0 };
  departmentGrowth: Array<{ dept_name: string; growth_rate: number }> = [];

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



  loadEmployees() {
    const filters: { 
      title?: string; 
      department?: string; 
      search?: string;
      page?: number;
      limit?: number;
    } = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.selectedTitle) filters.title = this.selectedTitle;
    if (this.selectedDepartment) filters.department = this.selectedDepartment;
    if (this.searchTerm && this.searchTerm.length >= 3) filters.search = this.searchTerm;

    this.employeeService.getAllEmployees(filters).subscribe({
      next: (response) => {
        const employees = response.employees || [];
        this.employees = employees;
        this.filteredEmployees = employees;
        this.totalPages = response.totalPages || 1;
        this.currentPage = response.page || 1;
        
        // Extract unique departments and titles if not already loaded
        if (!this.departments.length) {
          this.departments = [...new Set(employees
            .filter(emp => emp.department_name)
            .map(emp => emp.department_name))];
        }
        if (!this.titles.length) {
          this.titles = [...new Set(employees
            .filter(emp => emp.title)
            .map(emp => emp.title))];
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        // TODO: Show error message to user
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.isLoading = true;
    this.searchSubject.next(term);
  }

  filterEmployees() {
    this.loadEmployees();
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
    this.recentActivities = [
      { icon: '👤', title: 'Loading statistics...', time: 'Just now' }
    ];
  }

  updatePaginatedEmployees() {
    this.loadEmployees();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEmployees();
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  loadStatistics() {
    // Load employee stats
    this.employeeService.getEmployeeStats().subscribe({
      next: (stats: EmployeeStats) => {
        this.totalEmployees = stats.totalEmployees;
        this.averageSalary = stats.salaryStatistics.average;
        this.minSalary = stats.salaryStatistics.minimum;
        this.maxSalary = stats.salaryStatistics.maximum;

        this.recentActivities = [
          { 
            icon: '👥', 
            title: `${stats.totalEmployees} Total Employees`, 
            time: 'Current' 
          },
          { 
            icon: '📊', 
            title: `Gender Ratio: ${Math.round(stats.genderDistribution.male_count * 100 / stats.totalEmployees)}% Male`, 
            time: 'Current' 
          }
        ];
      },
      error: (error: any) => {
        console.error('Error loading statistics:', error);
        this.recentActivities = [{ 
          icon: '❌', 
          title: 'Error loading statistics', 
          time: 'Just now' 
        }];
      }
    });

    this.employeeService.getDepartmentGrowth().subscribe({
      next: (growth: any[]) => {
        this.departmentGrowth = growth;
      },
      error: (error: any) => console.error('Error loading department growth:', error)
    });

    this.employeeService.getSalaryTrends().subscribe({
      next: (trends: Array<{ year: number; month: number; average_salary: number; min_salary: number; max_salary: number }>) => {
        let prevAmount = 0;
        this.salaryTrends = trends.map(trend => {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const percentage = prevAmount ? ((trend.average_salary - prevAmount) / prevAmount) * 100 : 0;
          prevAmount = trend.average_salary;
          
          return {
            month: monthNames[trend.month - 1],
            amount: trend.average_salary,
            percentage: Number(percentage.toFixed(1))
          };
        });

        // Calculate salary growth
        if (trends.length >= 2) {
          const firstMonth = trends[0].average_salary;
          const lastMonth = trends[trends.length - 1].average_salary;
          this.salaryGrowth = Number(((lastMonth - firstMonth) / firstMonth * 100).toFixed(1));
        }

        // Update salary statistics if not already set
        if (trends.length > 0 && !this.averageSalary) {
          const lastTrend = trends[trends.length - 1];
          this.averageSalary = lastTrend.average_salary;
          this.minSalary = lastTrend.min_salary;
          this.maxSalary = lastTrend.max_salary;
        }
      },
      error: (error: any) => {
        console.error('Error loading salary trends:', error);
      }
    });
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
