import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';  // Import throwError from 'rxjs'
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Use apiUrl from environment
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch CSRF token from backend
  getCsrfToken(): Observable<{ csrfToken: string }> {
    return this.http.get<{ csrfToken: string }>(`${this.apiUrl}/csrf-token`, {
      withCredentials: true, // Ensure cookies are sent
    });
  }

  // Create a guest session and store the token in HttpOnly cookie
  createGuestSession(): Observable<{ token: string }> {
    return this.getCsrfToken().pipe(  // Fetch CSRF token before creating session
      switchMap((csrfResponse) => {
        const csrfToken = csrfResponse.csrfToken;

        // Now proceed to create the guest session
        return this.http.post<{ token: string }>(`${this.apiUrl}/auth/guest`, {}, {
          headers: { 'X-CSRF-Token': csrfToken },  // Add CSRF token to request headers
          withCredentials: true,  // Ensure cookies are sent
        }).pipe(
          tap((response) => {
            console.log('Guest session created successfully', response);
            // Token will be stored in HttpOnly cookie by backend
            this.tokenSubject.next(response.token); // Set the token in BehaviorSubject
          })
        );
      }),
      catchError((error) => {
        console.error('Error creating guest session:', error);
        return throwError(() => new Error('Failed to create guest session')); // Throw error if any step fails
      })
    );
  }

  // Refresh the guest token
  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true });
  }

  // Get the current token from HttpOnly cookies (using the backend to fetch the token)
  getToken(): Observable<string | null> {
    return this.token$.pipe(
      switchMap((token) => {
        if (token) {
          return of(token); // If the token is already available, return it
        } else {
          return this.refreshToken().pipe(
            tap((response) => {
              this.tokenSubject.next(response.token); // Update the BehaviorSubject with the new token
            }),
            switchMap(() => of(this.tokenSubject.value)) // Return the updated token
          );
        }
      }),
      catchError(() => of(null)) // Handle any errors (e.g., if refresh fails)
    );
  }

  // Decode and check if the token is expired
  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token); // Decode the JWT token
      const expirationTime = decoded.exp * 1000; // Convert expiration time to milliseconds
      return Date.now() > expirationTime; // Check if the token has expired
    } catch (error) {
      return true; // If decoding fails, assume the token is expired
    }
  }

  // Method to update the token from outside the service
  updateToken(token: string): void {
    this.tokenSubject.next(token); // Set the new token
  }

  // Session expiration handling: Check token and refresh if expired
  handleSessionExpiration(): Observable<void> {
    return this.getToken().pipe(
      tap((token) => {
        if (token && this.isTokenExpired(token)) {
          // If the token is expired, refresh it
          this.refreshToken().subscribe({
            next: (response) => {
              // Update the token in the BehaviorSubject after refresh
              this.tokenSubject.next(response.token);
            },
            error: (err) => {
              console.error('Token refresh failed:', err);
            },
          });
        }
      }),
      switchMap(() => of(void 0)) // Return `Observable<void>` after side effects
    );
  }
}
