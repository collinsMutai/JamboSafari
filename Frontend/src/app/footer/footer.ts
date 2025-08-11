import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Import necessary modules

@Component({
  selector: 'app-footer',
  standalone: true, // Make it standalone
  imports: [ReactiveFormsModule], // No additional modules needed here for now
  templateUrl: './footer.html', // Correct path to template
  styleUrls: ['./footer.css'], // Correct path to styles
})
export class Footer {
  contactForm: FormGroup;

  // Inject FormBuilder into the constructor
  constructor(private fb: FormBuilder) {
    // Initialize the form group in the constructor
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // Form submission handler
  onSubmit() {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      console.log('Form Submitted:', formData);
      // Handle form submission logic (e.g., call an API, display a message, etc.)
    }
  }
}
