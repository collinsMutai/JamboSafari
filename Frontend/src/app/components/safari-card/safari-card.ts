import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar service
import emailjs from 'emailjs-com'; // Import EmailJS SDK
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

  constructor(
    private sanitizer: DomSanitizer,
    private safariService: SafariService,
    private snackBar: MatSnackBar // Inject MatSnackBar service
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
  }

  // Handle form submission
  onSubmitBooking(): void {
    if (
      !this.name ||
      !this.email ||
      !this.phone ||
      !this.fromDate ||
      !this.toDate ||
      this.numAdults <= 0
    ) {
      this.showSnackbar('Please fill all required fields.', 'error');
      return;
    }

    this.name = this.sanitizeInput(this.name);
    this.email = this.sanitizeInput(this.email);
    this.phone = this.sanitizeInput(this.phone);
    this.fromDate = this.sanitizeInput(this.fromDate);
    this.toDate = this.sanitizeInput(this.toDate);

    if (this.numAdults <= 0 || this.numKids < 0) {
      this.showSnackbar('Invalid number of adults or kids.', 'error');
      return;
    }

    grecaptcha
      .execute('6LeCsKYrAAAAAAjUr_cM1jdd9dG8XhtYSvRmfOeJ', { action: 'submit' })
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

        emailjs
          .send(
            environment.emailJS.serviceID,
            environment.emailJS.templateID,
            formData,
            environment.emailJS.userID
          )
          .then(
            (response) => {
              console.log('Email sent successfully:', response);
              this.closeModal();
              this.showSnackbar('Your booking has been confirmed! A confirmation email has been sent.', 'success');
              this.clearForm();
            },
            (error) => {
              console.error('Error sending email:', error);
              this.showSnackbar('There was an error submitting the form. Please try again later.', 'error');
            }
          );
      })
      .catch((error: any) => {
        console.error('reCAPTCHA error:', error);
        this.showSnackbar('reCAPTCHA verification failed. Please try again.', 'error');
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

  sanitizeInput(input: string): string {
    return input.trim(); // Trim the whitespace
  }

  // Show Material Snackbar
  showSnackbar(message: string, type: string) {
    const snackBarClass = type === 'success' ? 'snackbar-success' : 'snackbar-error';

    const snackBarConfig = {
      duration: 3000,
      panelClass: [snackBarClass],  // Apply the custom class based on message type
      horizontalPosition: 'right' as 'right',
      verticalPosition: 'top' as 'top',
    };

    this.snackBar.open(message, 'Close', snackBarConfig);
  }
}
