import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  windowOrigin = window.location.origin;

  constructor(public auth: AuthService, private router: Router) {
    this.auth.isAuthenticated$.subscribe((loggedIn) => {
      if (loggedIn) {
        this.auth.appState$.subscribe((state) => {
          if (state?.target) {
            this.router.navigateByUrl(state.target);
          }
        });
      }
    });
  }

  login() {
    this.auth.loginWithRedirect({
      appState: { target: '/home' }
    });
  }
}
