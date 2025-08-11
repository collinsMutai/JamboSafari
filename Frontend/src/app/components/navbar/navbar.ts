import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NavbarComponent {
  isModalOpen = false;
  menuOpen = false;  // Track if the menu is open

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
}
