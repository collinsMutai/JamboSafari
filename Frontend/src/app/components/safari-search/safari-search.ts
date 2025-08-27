import { Component, OnInit } from '@angular/core';
import { SafariService, SafariPackage } from '../../safari-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import emailjs from 'emailjs-com';
import { environment } from '../../../environments/environment';

declare var grecaptcha: any;

@Component({
  selector: 'app-search-safari',
  templateUrl: './safari-search.html',
  styleUrls: ['./safari-search.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [SafariService],
})
export class SearchSafariComponent implements OnInit {
  searchQuery: string = '';
  filteredPackages: SafariPackage[] = [];
  selectedPackage: SafariPackage | null = null;
  activeModal: 'details' | 'booking' | null = null;

  // Booking Form Fields
  name: string = '';
  email: string = '';
  phone: string = '';
  numAdults: number = 1;
  numKids: number = 0;
  fromDate: string = '';
  toDate: string = '';
  showPaymentModal: boolean = false;

  constructor(
    private safariService: SafariService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredPackages = [];
      return;
    }

    this.safariService.getAllPackages().subscribe((packages: SafariPackage[]) => {
      this.filteredPackages = packages.filter(pkg =>
        pkg.title.toLowerCase().includes(query) ||
        pkg.includes.toLowerCase().includes(query) ||
        pkg.details.some(detail => detail.toLowerCase().includes(query))
      );
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredPackages = [];
  }

  openModal(pkg: SafariPackage, type: 'details' | 'booking') {
    this.selectedPackage = pkg;
    this.activeModal = type;
  }

  closeModal(): void {
    this.selectedPackage = null;
    this.activeModal = null;
    this.showPaymentModal = false;
  }

  onSubmitBooking(): void {
    if (
      !this.name || !this.email || !this.phone ||
      !this.fromDate || !this.toDate || this.numAdults <= 0
    ) {
      this.showSnackbar('Please fill all required fields.', 'error');
      return;
    }

    grecaptcha.execute('6LeCsKYrAAAAAAjUr_cM1jdd9dG8XhtYSvRmfOeJ', { action: 'submit' })
      .then((token: string) => {
        const formData = {
          name: this.name,
          email: this.email,
          phone: this.phone,
          numAdults: this.numAdults,
          numKids: this.numKids,
          fromDate: this.fromDate,
          toDate: this.toDate,
          packageTitle: this.selectedPackage?.title ?? '',
          recaptchaToken: token,
        };

        emailjs.send(
          environment.emailJS.serviceID,
          environment.emailJS.templateID,
          formData,
          environment.emailJS.userID
        ).then(() => {
          this.showSnackbar('Your booking is confirmed!', 'success');
          this.showPaymentModal = true;  // Show the payment modal
          this.clearForm();  // Reset the form fields
          this.closeModal();  // Close the booking modal
        }).catch((error) => {
          console.error('Email send error:', error);
          this.showSnackbar('There was an error. Try again.', 'error');
        });
      }).catch(() => {
        this.showSnackbar('reCAPTCHA failed. Try again.', 'error');
      });
  }

  goToPayment(): void {
    this.closeModal();
    this.router.navigate(['/payment']);
  }

  sanitizeInput(input: string): string {
    return input.trim();
  }

  showSnackbar(message: string, type: 'success' | 'error') {
    const snackBarClass = type === 'success' ? 'snackbar-success' : 'snackbar-error';
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [snackBarClass],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  clearForm(): void {
    // Reset all form fields to their initial state
    this.name = '';
    this.email = '';
    this.phone = '';
    this.numAdults = 1;
    this.numKids = 0;
    this.fromDate = '';
    this.toDate = '';
  }
}
