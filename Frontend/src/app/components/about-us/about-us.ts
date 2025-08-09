import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUs implements OnInit {
  lastScrollTop = 0;  // Track last scroll position

  constructor() {}

  ngOnInit(): void {
    // We can setup animations here
    this.setupScrollAnimations();
  }

  // Listen to window scroll events
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Check if scrolling up
    if (currentScroll < this.lastScrollTop) {
      this.triggerScrollAnimations();
    }

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll
  }

  // Setup scroll animations
  setupScrollAnimations() {
    const sections = document.querySelectorAll('.fade-section'); // Select all sections to animate

    sections.forEach((section: Element) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            section.classList.add('animate'); // Add the animation class
          }
        },
        {
          threshold: 0.3,  // 30% visibility for triggering animation
        }
      );
      observer.observe(section); // Observe each section
    });
  }

  // Trigger animations when scrolling up
  triggerScrollAnimations() {
    const sections = document.querySelectorAll('.fade-section');
    sections.forEach((section: Element) => {
      if (this.isElementInViewport(section)) {
        section.classList.add('animate');
      }
    });
  }

  // Check if an element is in the viewport
  isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}
