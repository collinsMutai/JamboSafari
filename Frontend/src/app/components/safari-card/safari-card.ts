import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser'; // Import Angular sanitizer
import emailjs from 'emailjs-com'; // Import EmailJS SDK
import { environment } from '../../../environments/environment';

declare var grecaptcha: any; // Declare the global grecaptcha object for TypeScript

@Component({
  selector: 'app-safari-card',
  templateUrl: './safari-card.html',
  styleUrls: ['./safari-card.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class SafariCard {
  safariPackages = [
    {
      title: '🗓️ 3-Day Beginners Safari',
      includes: 'Maasai Mara, Lake Nakuru, or Lake Naivasha',
      details: ['Daily game drives', 'Lodges & meals', 'Transfers & guides'],
      image: 'assets/images/cheetah1.jpeg',
      showDetails: false,
      fullDetails: 'This 3-day safari includes daily game drives through Maasai Mara, Lake Nakuru, and Lake Naivasha, all with luxury lodges, meals, and expert guides.'
    },
    {
      title: '🗓️ 7-Day Classic Safari',
      includes: 'Maasai Mara, Lake Nakuru, Cultural Visit',
      details: ['Daily game drives', 'Lodges & meals', 'Transfers & guides'],
      image: 'assets/images/giraffe1.jpeg',
      showDetails: false,
      fullDetails: 'This 7-day safari provides an in-depth experience, including visits to Maasai Mara, Lake Nakuru, and a cultural visit to a local Maasai village.'
    },
    {
      title: '🗓️ 10-Day Deluxe Safari + Mission',
      includes:
        'Combine safari with service—visit schools, churches, or clinics.',
      details: [
        'Perfect for youth or mission teams',
        'Includes devotionals and worship sessions',
      ],
      image: 'assets/images/lions1.jpeg',
      showDetails: false,
      fullDetails: 'The 10-day deluxe safari includes not only breathtaking safaris but also mission activities like visiting local schools, churches, and clinics.'
    },
    {
      title: '🗓️ 14-Day Grand Safari',
      includes: 'Kenya & Tanzania combo: Mara, Serengeti, Ngorongoro',
      details: ['Optional 3-day Zanzibar retreat'],
      image: 'assets/images/wilderbeast1.jpeg',
      showDetails: false,
      fullDetails: 'This is the ultimate safari experience, covering both Kenya and Tanzania with the Mara, Serengeti, Ngorongoro, and an optional 3-day Zanzibar retreat.'
    },
  ];

  selectedPackageDetails: string | null = null;
  selectedPackage: any = null; // Add this line to store selected package details

  // Modal form data
  name: string = '';
  email: string = ''; // Email field
  phone: string = ''; // Phone field
  numAdults: number = 1;
  numKids: number = 0;
  fromDate: string = '';
  toDate: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  openModal(packageTitle: string) {
    this.selectedPackageDetails = packageTitle;
  }

  openDetailsModal(packageDetails: any) {
    this.selectedPackage = packageDetails; // Store the selected package for viewing its details
  }

  closeModal() {
    this.selectedPackageDetails = null;
    this.selectedPackage = null; // Reset selected package
  }

  // Handle the form submission
  onSubmitBooking() {
    if (
      !this.name ||
      !this.email ||
      !this.phone ||
      !this.fromDate ||
      !this.toDate ||
      this.numAdults <= 0
    ) {
      alert('Please fill all required fields.');
      return;
    }

    // Sanitize inputs
    this.name = this.sanitizeInput(this.name);
    this.email = this.sanitizeInput(this.email);
    this.phone = this.sanitizeInput(this.phone);
    this.fromDate = this.sanitizeInput(this.fromDate);
    this.toDate = this.sanitizeInput(this.toDate);

    if (this.numAdults <= 0 || this.numKids < 0) {
      alert('Invalid number of adults or kids.');
      return;
    }

    // Trigger reCAPTCHA
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
          packageTitle: this.selectedPackageDetails, // Include the selected package details
          recaptchaToken: token,
        };

        // Send email using EmailJS
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
              alert(
                'Your booking has been confirmed! A confirmation email has been sent.'
              );

              // Clear the form fields after successful submission
              this.clearForm();
            },
            (error) => {
              console.error('Error sending email:', error);
              alert(
                'There was an error submitting the form. Please try again later.'
              );
            }
          );
      })
      .catch((error: any) => {
        console.error('reCAPTCHA error:', error);
        alert('reCAPTCHA verification failed. Please try again.');
      });
  }

  // Reset form fields to initial values
  clearForm() {
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
    return input.trim(); // Trimming whitespace
  }
}
