/**
 * Enigma HR Solutions - Main Application Component
 * 
 * This is the root component of the Enigma HR Solutions application.
 * It serves as the main container for the entire application and handles
 * the routing outlet for all other components.
 * 
 * @author Ramanavenky22
 * @version 1.0.0
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.component.css'
})
export class AppComponent {
  /**
   * The title of the application
   */
  title = 'Enigma HR Solutions';

  /**
   * Constructor for the AppComponent
   * Initializes the root component of the application
   */
  constructor() {
    // Initialize any required services or configurations
  }
}
