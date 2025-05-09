import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  picture: string;
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

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadTeamMembers();
  }

  loadTeamMembers() {
    // Simulated data - replace with actual API calls
    this.teamMembers = [
      {
        id: 1,
        name: 'John Doe',
        position: 'Senior Developer',
        department: 'Engineering',
        picture: 'https://i.pravatar.cc/150?img=1'
      },
      {
        id: 2,
        name: 'Jane Smith',
        position: 'Product Manager',
        department: 'Product',
        picture: 'https://i.pravatar.cc/150?img=2'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        position: 'UX Designer',
        department: 'Design',
        picture: 'https://i.pravatar.cc/150?img=3'
      }
    ];
    this.filteredMembers = [...this.teamMembers];
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase();
    this.filteredMembers = this.teamMembers.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.position.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query)
    );
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  viewProfile(id: number) {
    // For testing, always navigate to employee 499999
    this.router.navigate(['/employees', 499999]);
  }
}
