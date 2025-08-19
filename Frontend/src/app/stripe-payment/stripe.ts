import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface CheckoutSessionResponse {
  sessionId: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
}

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createCheckoutSession(
    amount: number,
    currency: string = 'usd',
    description: string = 'Payment'
  ): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/stripe/create-checkout-session`,
      {
        amount,
        currency,
        description,
      }
    );
  }

  createPaymentIntent(bookingData: any): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrl}/checkout`,
      bookingData
    );
  }
}
