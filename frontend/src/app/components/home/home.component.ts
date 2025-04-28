import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  windowOrigin = window.location.origin;

  constructor(private router: Router, public auth: AuthService) {}

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
