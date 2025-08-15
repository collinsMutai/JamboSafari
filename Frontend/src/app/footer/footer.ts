import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // For common Angular directives
import { DomSanitizer } from '@angular/platform-browser'; // Angular sanitizer
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Import MatSnackBarModule
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar service
import emailjs from 'emailjs-com'; // Import EmailJS SDK
import { environment } from '../../environments/environment';

declare var grecaptcha: any; // Declare the global grecaptcha object for TypeScript

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule, // Angular's common directives (e.g. ngIf, ngFor)
    ReactiveFormsModule, // Reactive forms module for handling the form
    MatSnackBarModule // Import MatSnackBarModule here
  ],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer implements OnInit {
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private snackBar: MatSnackBar // Inject MatSnackBar service
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      recaptchaToken: ['', Validators.required], // Hidden field for reCAPTCHA token
    });
  }

  ngOnInit() {
    this.loadRecaptchaScript();
  }

  // Dynamically load the reCAPTCHA script
  loadRecaptchaScript() {
    if (typeof grecaptcha !== 'undefined') {
      this.initializeRecaptcha();
      return;
    }

    const script = this.renderer.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${environment.reCAPTCHA.siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initializeRecaptcha();
    };

    this.renderer.appendChild(document.head, script);
  }

  // Initialize reCAPTCHA after script has loaded
  initializeRecaptcha() {
    if (grecaptcha) {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(environment.reCAPTCHA.siteKey, { action: 'submit' })
          .then((token: string) => {
            this.contactForm.patchValue({ recaptchaToken: token });
          })
          .catch((error: any) => {
            console.error('reCAPTCHA error:', error);
          });
      });
    } else {
      console.error('reCAPTCHA script failed to load');
    }
  }

  // Handle form submission
  onSubmit() {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;

      // Sanitize inputs to prevent XSS or any unsafe content
      formData.name = this.sanitizeInput(formData.name);
      formData.email = this.sanitizeInput(formData.email);
      formData.message = this.sanitizeInput(formData.message);

      // Send the form data to EmailJS
      this.sendEmail(formData);

      // Reset the form
      this.contactForm.reset();
    } else {
      this.showSnackbar('Form is invalid', 'error');
    }
  }

  // Helper method to sanitize input data by stripping dangerous HTML tags
  sanitizeInput(input: string): string {
    return this.sanitizeInputForHTML(input);
  }

  // Optionally, you could also check that the input doesn't contain dangerous HTML tags
  sanitizeInputForHTML(input: string): string {
    return this.sanitizer.sanitize(1, input) || input; // 1 corresponds to the `SECURITY_TRUSTED_HTML`
  }

  // Method to send the email using EmailJS
  sendEmail(formData: any) {
    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    // Send the email using EmailJS service
    emailjs
      .send(
        environment.emailJS.serviceID,
        environment.emailJS.contactTemplateID,
        templateParams, // Form data to be sent in the email
        environment.emailJS.userID
      )
      .then((response) => {
        console.log('Email sent successfully', response);
        this.showSnackbar('Message sent successfully!', 'success');
      })
      .catch((error) => {
        console.error('Email sending failed', error);
        this.showSnackbar('There was an error sending your message. Please try again later.', 'error');
      });
  }

  // Show a Material Snackbar message
showSnackbar(message: string, type: string) {
  // Determine which class to apply based on the message type
  let snackBarClass = type === 'success' ? 'snackbar-success' : 'snackbar-error';

  // Snackbar configuration
  const snackBarConfig = {
    duration: 3000,
    panelClass: [snackBarClass],  // Apply the custom class based on message type
    horizontalPosition: 'right' as 'right',
    verticalPosition: 'top' as 'top',
  };

  // Open the snackbar
  this.snackBar.open(message, 'Close', snackBarConfig);
}

}
