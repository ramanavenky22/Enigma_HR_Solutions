import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService, TeamMember } from '../../services/team.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  team: TeamMember[] = [];
  loading = true;
  error = '';

  constructor(private teamService: TeamService) {}

  ngOnInit() {
    this.teamService.getTeam().subscribe({
      next: (data) => {
        this.team = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load team.';
        this.loading = false;
      }
    });
  }
}

