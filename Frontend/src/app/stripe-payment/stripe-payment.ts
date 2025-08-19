import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeService } from './stripe'; // make sure path is correct
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stripe-payment.html',
  styleUrls: ['./stripe-payment.css'],
})
export class StripePayment {
  private stripe: Stripe | null = null;

  // Hardcoded booking data as per your example
bookingData = {
  name: 'Collins Mutai',
  email: 'Collinsfrontend@gmail.com',
  phone: '0726097666',
  numAdults: 1,
  numKids: 1,
  fromDate: '2025-08-22',
  toDate: '2025-08-29',
  packageTitle: '🗓️ 10-Day Deluxe Safari + Mission',
  cost: 150000 // e.g., 150000 cents = $1500.00
};


  constructor(private stripeService: StripeService) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    this.stripe = await loadStripe(environment.stripePublicKey);
  }

  async startCheckout() {
    try {
      // Send booking data to backend to create payment intent
      const response = await this.stripeService
        .createPaymentIntent(this.bookingData)
        .toPromise();

      if (response?.clientSecret && this.stripe) {
        // You could now use stripe.confirmCardPayment(clientSecret, {...}) to complete payment
        // Or just log the clientSecret for now:
        console.log('PaymentIntent client secret:', response.clientSecret);

        // For demo, you might want to implement confirmation UI here
        // For now just alert success:
        alert('Payment intent created. Client secret received. Implement payment confirmation next.');
      } else {
        console.error('Stripe not initialized or clientSecret missing');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  }
}
