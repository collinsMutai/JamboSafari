import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Import Router

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class NavbarComponent {
  isModalOpen = false;  // Modal state
  menuOpen = false;     // Track if the mobile menu is open

  constructor(private router: Router) {} // Inject Router

  // Function to open the modal
  openModal() {
    this.isModalOpen = true;
  }

  // Function to close the modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Function to toggle the mobile menu visibility
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Function to close the menu when a link is clicked
  navigateAndCloseMenu() {
    if (this.menuOpen) {
      this.toggleMenu();  // Close the menu
    }
    // If using Angular Router (optional): navigate to the target route
    // this.router.navigate([linkTarget]);
  }

   navigateToSafaris() {
    // Navigate to the home page and scroll to #safaris
    this.router.navigate(['/'], { fragment: 'safaris' });
  }
}
