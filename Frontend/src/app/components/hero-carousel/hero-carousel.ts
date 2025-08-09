import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hero-carousel',
  templateUrl: './hero-carousel.html',
  styleUrls: ['./hero-carousel.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HeroCarousel implements OnInit, OnDestroy {
  // Array of slides to display in the carousel, now includes bookNowText
  slides = [
    {
      image: 'assets/images/slide1.jpg',
      alt: 'Maasai Mara',
      title: '🦁 JAMBO SAFARI',
      description: 'Experience the Majesty of God’s Creation in the Heart of Africa',
      buttonText: 'Discover',
      bookNowText: 'Book Now' // Added "Book Now" text for the second button
    },
    {
      image: 'assets/images/hero10.jpg',
      alt: 'Lake Nakuru',
      title: '🦁 JAMBO SAFARI',
      description: 'Experience the Majesty of God’s Creation in the Heart of Africa',
      buttonText: 'Discover',
      bookNowText: 'Book Now' // Added "Book Now" text for the second button
    },
    {
      image: 'assets/images/slide3.jpg',
      alt: 'Amboseli',
      title: '🦁 JAMBO SAFARI',
      description: 'Experience the Majesty of God’s Creation in the Heart of Africa',
      buttonText: 'Discover',
      bookNowText: 'Book Now' // Added "Book Now" text for the second button
    }
  ];

  currentSlideIndex: number = 0;
  slideInterval: any; // To hold the interval reference

  ngOnInit(): void {
    // Start auto-slide every 3 seconds
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    // Clean up the interval when component is destroyed
    clearInterval(this.slideInterval);
  }

  // Start auto-slide functionality
  startAutoSlide() {
    // Change slides every 3 seconds
    this.slideInterval = setInterval(() => {
      this.moveSlide(1); // Move to the next slide
    }, 5000); // Change to 5000 for a 5-second interval
  }

  // Function to change the current slide
  moveSlide(direction: number): void {
    this.currentSlideIndex += direction;
    if (this.currentSlideIndex >= this.slides.length) {
      this.currentSlideIndex = 0; // Loop back to the first slide
    }
    if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1; // Loop back to the last slide
    }
  }
}
