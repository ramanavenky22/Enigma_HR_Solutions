import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  loading = true;
  error = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    // Use a sample empId for now. Replace with dynamic user ID in production.
    const empId = 10001;
    this.profileService.getProfile(empId).subscribe({
      next: (data: any) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load profile';
        this.loading = false;
      }
    });
  }
}

