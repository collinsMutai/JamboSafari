import { Component, HostListener } from '@angular/core';
import { DestinationAndHighlightsComponent } from '../destination-and-highlights/destination-and-highlights';
import { HeroCarousel } from '../hero-carousel/hero-carousel';
import { AboutUs } from '../about-us/about-us';
import { SafariCard } from '../safari-card/safari-card';
import { Footer } from '../../footer/footer';
import { TestimonialsComponent } from '../testimonials/testimonials';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DestinationAndHighlightsComponent,
    HeroCarousel,
    AboutUs,
    SafariCard,
    Footer,
    TestimonialsComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  isScrolled: boolean = false;

  // Listen to the scroll event
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 100; // This will track if the page has been scrolled
  }

  // Scroll to top method
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
