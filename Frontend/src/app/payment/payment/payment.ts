import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../payment';
import { AuthService } from '../auth'; // Import AuthService
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
  imports: [CommonModule, FormsModule], // Import FormsModule here for template-driven forms
})
export class PaymentComponent implements OnInit {
  paymentData = {
    amount: 0,
    description: '',
    reference: '',
    email: '',
    phone: '',
    redirectUrl: '',
    paymentMethod: 'Pesapal', // Default to Pesapal, can be changed by the user
  };

  csrfToken: string = '';
  guestToken: string = '';
  paymentUrl: string = '';
  isPaymentInProgress: boolean = false; // Add flag to prevent double submission

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService, // Inject AuthService
    private router: Router
  ) {}

  ngOnInit(): void {
    // Create guest session and retrieve CSRF token
    this.createGuestSession();
  }

  // Create a guest session to generate the guest token
  createGuestSession(): void {
    this.authService.createGuestSession().subscribe(
      (response) => {
        this.guestToken = response.token; // Store the guest token
        this.getCsrfToken(); // Fetch the CSRF token
      },
      (error) => {
        console.error('Error creating guest session:', error);
      }
    );
  }

  // Get the CSRF token from the backend
  getCsrfToken(): void {
    this.paymentService.getCsrfToken().subscribe(
      (response) => {
        this.csrfToken = response.csrfToken; // Store CSRF token for payment request
      },
      (error) => {
        console.error('Error retrieving CSRF token:', error);
      }
    );
  }

  // Submit the payment request
  onSubmitPayment(): void {
    if (this.isPaymentInProgress) {
      return; // Prevent double submission
    }

    this.isPaymentInProgress = true; // Set flag to true while submitting

    this.authService.getToken().subscribe((token) => {
      if (!token) {
        console.error('No guest token available');
        this.isPaymentInProgress = false; // Reset flag on error
        return;
      }

      // Check if the token is expired
      if (this.authService.isTokenExpired(token)) {
        console.log('Token expired. Refreshing token...');
        this.authService.refreshToken().subscribe(
          (response) => {
            token = response.token; // Use the refreshed token
            this.authService.updateToken(token); // Update the token using the new method
            this.retryPaymentRequest(token); // Retry payment request with the refreshed token
          },
          (error) => {
            console.error('Error refreshing token:', error);
            this.isPaymentInProgress = false; // Reset flag on error
          }
        );
      } else {
        // Token is still valid, proceed with the payment request
        this.retryPaymentRequest(token);
      }
    });
  }

  // Method to retry the payment request with the valid token
  retryPaymentRequest(token: string): void {
    this.paymentService
      .requestPayment(this.paymentData, this.csrfToken, token) // Send the payment request
      .subscribe(
        (response) => {
          this.paymentUrl = response.paymentUrl; // Get the payment URL
          window.location.href = this.paymentUrl; // Redirect to the payment page
          this.isPaymentInProgress = false; // Reset flag after successful payment request
        },
        (error) => {
          console.error('Error processing payment:', error);
          this.isPaymentInProgress = false; // Reset flag on error
        }
      );
  }
}
