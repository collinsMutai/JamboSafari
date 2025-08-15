import { Component } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // For common Angular directives
import { DomSanitizer } from '@angular/platform-browser';  // Angular sanitizer

declare var grecaptcha: any;  // Declare the global grecaptcha object for TypeScript

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,           // Angular's common directives (e.g. ngIf, ngFor)
    ReactiveFormsModule     // Reactive forms module for handling the form
  ],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      recaptchaToken: ['', Validators.required]  // Hidden field for reCAPTCHA token
    });
  }

  // This method will trigger the reCAPTCHA validation and token generation
  onSubmit() {
    if (this.contactForm.valid) {
      let formData = this.contactForm.value;

      // Sanitize inputs to prevent XSS or any unsafe content
      formData.name = this.sanitizeInput(formData.name);
      formData.email = this.sanitizeInput(formData.email);
      formData.message = this.sanitizeInput(formData.message);

      // Execute reCAPTCHA and get token
      grecaptcha.execute('6LeCsKYrAAAAAAjUr_cM1jdd9dG8XhtYSvRmfOeJ', { action: 'submit' }).then((token: string) => {
        // Add token to form data
        formData.recaptchaToken = token;

        // Now, you can send the sanitized form data including the reCAPTCHA token to your server
        console.log('Form Submitted with reCAPTCHA Token:', formData);

        // Example of making an API call to your server
        // this.myService.submitForm(formData).subscribe(response => {
        //   console.log('Form submitted successfully');
        // });
      }).catch((error: any) => {  // Explicitly declare 'error' as 'any'
        console.error('reCAPTCHA error:', error);
        // Handle error if reCAPTCHA fails
      });
    }
  }

  // Helper method to sanitize input data by stripping dangerous HTML tags
  sanitizeInput(input: string): string {
    return this.sanitizeInputForHTML(input);
  }

  // Optionally, you could also check that the input doesn't contain dangerous HTML tags
  sanitizeInputForHTML(input: string): string {
    // Sanitize HTML and return as string (i.e., remove dangerous tags)
    return this.sanitizer.sanitize(1, input) || input; // 1 corresponds to the `SECURITY_TRUSTED_HTML`
  }
}
