import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destination-and-highlights',
  templateUrl: './destination-and-highlights.html',
  styleUrls: ['./destination-and-highlights.css'],
  imports: [CommonModule],
  standalone: true,
})
export class DestinationAndHighlightsComponent implements OnInit, OnDestroy {
  originalImages = [
    {
      image: 'assets/images/maasai4.jpeg',
      alt: 'Maasai Mara',
      title: 'Maasai Mara',
      country: 'Kenya',
      description: 'Big Five sightings and the Great Migration',
    },
    {
      image: 'assets/images/lakenakuru.jpeg',
      alt: 'Lake Nakuru',
      title: 'Lake Nakuru',
      country: 'Kenya',
      description: 'Pink flamingos and rhinos by the water',
    },
    {
      image: 'assets/images/elephants1.jpeg',
      alt: 'Amboseli',
      title: 'Amboseli',
      country: 'Kenya',
      description: 'Majestic elephants under Mt. Kilimanjaro',
    },
    {
      image: 'assets/images/maasaimara3.jpeg',
      alt: 'Serengeti',
      title: 'Serengeti',
      country: 'Tanzania',
      description: 'Endless plains and epic wildlife scenes',
    },
    {
      image: 'assets/images/greycrownedcrane.jpeg',
      alt: 'Ngorongoro Crater',
      title: 'Ngorongoro Crater',
      country: 'Tanzania',
      description: 'A world within a crater',
    },
    {
      image: 'assets/images/giraffe2.jpeg',
      alt: 'Zanzibar',
      title: 'Zanzibar',
      country: 'Tanzania',
      description: 'Spice island paradise & beach retreat',
    },
  ];

  images = [...this.originalImages];
  currentSlideIndex = 0;
  autoSlideInterval: any;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Start the auto-slide functionality
    this.startAutoSlide();
  }

  ngOnDestroy() {
    // Clean up the interval when the component is destroyed
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Start the auto slide interval
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.moveToNextSlide();
    }, 5000); // Slide every 5 seconds
  }

  // Move to the next slide
  moveToNextSlide() {
    const maxIndex = this.images.length - 1;
    if (this.currentSlideIndex < maxIndex) {
      this.currentSlideIndex++;
    } else {
      // After last slide, reset to the first slide
      this.currentSlideIndex = 0;
    }
    this.updateSlider();
  }

  // Move to the previous slide
  moveToPrevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
    this.updateSlider();
  }

  // Update the slider's position based on the current slide index
  updateSlider() {
    const sliderWrapper =
      this.el.nativeElement.querySelector('.slider-wrapper');
    if (sliderWrapper) {
      const translateX = -this.currentSlideIndex * 100; // 100% width of the slide
      this.renderer.setStyle(
        sliderWrapper,
        'transform',
        `translateX(${translateX}%)`
      );
    }
  }
}
