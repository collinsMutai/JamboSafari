import {
  Component,
  OnInit,
  AfterViewInit,
  Renderer2,
  ElementRef,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destination-and-highlights',
  templateUrl: './destination-and-highlights.html',
  styleUrls: ['./destination-and-highlights.css'],
  imports: [CommonModule],
  standalone: true,
})
export class DestinationAndHighlightsComponent implements OnInit, AfterViewInit {
  originalImages = [
    { image: 'assets/images/maasai-mara.jpg', alt: 'Maasai Mara', title: 'Maasai Mara', country: 'Kenya', description: 'Big Five sightings and the Great Migration' },
    { image: 'assets/images/lake-nakuru.jpg', alt: 'Lake Nakuru', title: 'Lake Nakuru', country: 'Kenya', description: 'Pink flamingos and rhinos by the water' },
    { image: 'assets/images/amboseli.jpg', alt: 'Amboseli', title: 'Amboseli', country: 'Kenya', description: 'Majestic elephants under Mt. Kilimanjaro' },
    { image: 'assets/images/serengeti.jpg', alt: 'Serengeti', title: 'Serengeti', country: 'Tanzania', description: 'Endless plains and epic wildlife scenes' },
    { image: 'assets/images/ngorongoro.jpg', alt: 'Ngorongoro Crater', title: 'Ngorongoro Crater', country: 'Tanzania', description: 'A world within a crater' },
    { image: 'assets/images/zanzibar.jpg', alt: 'Zanzibar', title: 'Zanzibar', country: 'Tanzania', description: 'Spice island paradise & beach retreat' },
  ];

  images: any[] = [];
  currentSlideIndex = 0;
  slideFullWidth = 0;
  visibleSlides = 4; // Default to 4 slides visible at a time
  autoSlideInterval: any;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.images = [...this.originalImages];
    this.updateSliderWidth();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.updateSliderWidth();
      this.updateSlider();
      // Start auto sliding every 5 seconds
      this.autoSlideInterval = setInterval(() => {
        this.moveToNextSlide();
      }, 5000); // 5000 ms = 5 seconds
    }, 100);
  }

  ngOnDestroy() {
    // Clean up the interval when the component is destroyed
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateVisibleSlides();
    setTimeout(() => {
      this.updateSliderWidth();
      this.updateSlider();
    }, 100);
  }

  updateVisibleSlides() {
    const width = window.innerWidth;
    if (width <= 767) {
      this.visibleSlides = 1; // 1 slide on mobile
    } else if (width <= 1024) {
      this.visibleSlides = 3; // 3 slides on medium screens
    } else {
      this.visibleSlides = 4; // 4 slides on large screens (main behavior)
    }
  }

  moveToNextSlide() {
    const maxIndex = this.images.length - this.visibleSlides;
    if (this.currentSlideIndex < maxIndex) {
      this.currentSlideIndex++;
    } else {
      // Reset to the first slide when we reach the last slide
      this.currentSlideIndex = 0;
    }
    this.updateSlider();
  }

  moveToPrevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
    this.updateSlider();
  }

  updateSlider() {
    const sliderWrapper = this.el.nativeElement.querySelector('.slider-wrapper');
    if (sliderWrapper) {
      const translateX = -this.currentSlideIndex * this.slideFullWidth;
      this.renderer.setStyle(sliderWrapper, 'transform', `translateX(${translateX}px)`);
    }
  }

  updateSliderWidth() {
    const slide = this.el.nativeElement.querySelector('.destination-slide');
    if (slide) {
      const style = getComputedStyle(slide);
      const marginRight = parseFloat(style.marginRight) || 0;
      const width = slide.offsetWidth; // This is the width of one slide
      this.slideFullWidth = width + marginRight;

      const sliderWrapper = this.el.nativeElement.querySelector('.slider-wrapper');
      const totalVisibleWidth = this.visibleSlides * this.slideFullWidth;
      this.renderer.setStyle(sliderWrapper, 'width', `${totalVisibleWidth}px`);
    }
  }
}
