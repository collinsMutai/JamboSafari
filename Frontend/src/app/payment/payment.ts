import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = environment.apiUrl; // Backend API URL from environment

  constructor(private http: HttpClient) {}

  // Get CSRF Token from the backend
  getCsrfToken(): Observable<{ csrfToken: string }> {
    return this.http.get<{ csrfToken: string }>(`${this.apiUrl}/csrf-token`, {
      withCredentials: true, // Ensure cookies are sent
    });
  }

  // Request payment from the backend
  requestPayment(paymentData: any, csrfToken: string, guestToken: string): Observable<{ paymentUrl: string }> {
    const headers = new HttpHeaders({
      'X-CSRF-TOKEN': csrfToken, // Add CSRF token to the headers
      'Authorization': `Bearer ${guestToken}`, // Include the guest token for authorization
    });

    return this.http.post<{ paymentUrl: string }>(
      `${this.apiUrl}/payment/request`,
      paymentData,
      { headers, withCredentials: true } // Ensure cookies are sent with the request
    );
  }
}
