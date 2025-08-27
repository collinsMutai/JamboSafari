import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // <-- for navigation
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import emailjs from 'emailjs-com';
import { environment } from '../../../environments/environment';
import { SafariService, SafariPackage } from '../../safari-service';

declare var grecaptcha: any;

@Component({
  selector: 'app-safari-card',
  templateUrl: './safari-card.html',
  styleUrls: ['./safari-card.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [SafariService],
})
export class SafariCard implements OnInit {
  safariPackages: SafariPackage[] = [];
  selectedPackageDetails: string | null = null;
  selectedPackage: SafariPackage | null = null;

  name: string = '';
  email: string = '';
  phone: string = '';
  numAdults: number = 1;
  numKids: number = 0;
  fromDate: string = '';
  toDate: string = '';

  showPaymentModal: boolean = false;

  constructor(
    private router: Router, // <-- Inject Router
    private sanitizer: DomSanitizer,
    private safariService: SafariService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.safariService.getAllPackages().subscribe((packages: SafariPackage[]) => {
      this.safariPackages = packages;
    });
  }

  openModal(packageTitle: string): void {
    this.selectedPackageDetails = packageTitle;
  }

  openDetailsModal(packageTitle: string): void {
    this.safariService.getPackageByTitle(packageTitle).subscribe((packageData: SafariPackage | undefined) => {
      this.selectedPackage = packageData ?? null;
    });
  }

  closeModal(): void {
    this.selectedPackageDetails = null;
    this.selectedPackage = null;
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
          packageTitle: this.selectedPackageDetails,
          recaptchaToken: token,
        };

        emailjs.send(
          environment.emailJS.serviceID,
          environment.emailJS.templateID,
          formData,
          environment.emailJS.userID
        ).then(() => {
          this.showSnackbar('Your booking is confirmed!', 'success');
          this.clearForm()
          // this.showPaymentModal = true; 
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

  showSnackbar(message: string, type: string) {
    const snackBarClass = type === 'success' ? 'snackbar-success' : 'snackbar-error';
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [snackBarClass],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  clearForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.numAdults = 1;
    this.numKids = 0;
    this.fromDate = '';
    this.toDate = '';
    this.selectedPackageDetails = null;
  }
}
