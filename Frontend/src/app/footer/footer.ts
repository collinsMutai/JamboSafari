import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecaptchaModule } from 'ng-recaptcha';
import emailjs from 'emailjs-com';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RecaptchaModule,
  ],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  contactForm: FormGroup;
  siteKey: string = environment.recaptchaSiteKey;
  recaptchaToken: string | null = null;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      recaptcha: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.contactForm.invalid || !this.recaptchaToken) {
      this.showSnackbar(
        'Please complete all fields and the reCAPTCHA.',
        'error'
      );
      return;
    }

    const formData = this.contactForm.value;

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      'g-recaptcha-response': this.recaptchaToken,
    };

    emailjs
      .send(
        environment.emailJS.serviceID,
        environment.emailJS.contactTemplateID,
        templateParams,
        environment.emailJS.userID
      )
      .then(() => {
        this.showSnackbar('Message sent successfully!', 'success');
        this.contactForm.reset();
        this.recaptchaToken = null;
      })
      .catch((error) => {
        console.error('Email sending failed', error);
        this.showSnackbar('Failed to send message. Please try again.', 'error');
      });
  }

  onCaptchaResolved(token: string | null): void {
    if (token) {
      this.recaptchaToken = token;
      this.contactForm.patchValue({ recaptcha: token });
    } else {
      this.recaptchaToken = null;
      this.contactForm.patchValue({ recaptcha: '' });
    }
  }

  showSnackbar(message: string, type: 'success' | 'error') {
    const snackBarClass =
      type === 'success' ? 'snackbar-success' : 'snackbar-error';

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [snackBarClass],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
