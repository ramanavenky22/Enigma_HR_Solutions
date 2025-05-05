import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  windowOrigin = window.location.origin;

  constructor(private router: Router, public auth: AuthService) {}

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
