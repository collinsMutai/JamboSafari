import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
  styleUrls: ['./testimonials.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  testimonials = [
    {
      text: "Jambo Safari was a sacred encounter with God’s beauty. Our team came back transformed.",
      author: "Pastor Bowen M., Miami, FL"
    },
    {
      text: "The Mara sunrise reminded me of Psalm 19: ‘The heavens declare the glory of God.’",
      author: "Joan L., Jamaica"
    },
    {
      text: "The Maasai Mara experience was nothing short of amazing! It’s hard to put into words the beauty we saw.",
      author: "John D., London, UK"
    }
  ];

  currentIndex = 0;
  private sliderInterval: any;

  ngOnInit() {
    // Auto transition testimonials every 3 seconds
    this.sliderInterval = setInterval(() => {
      this.nextTestimonial();
    }, 3000); // Change every 3 seconds
  }

  ngOnDestroy() {
    // Clear the interval when the component is destroyed to avoid memory leaks
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextTestimonial() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }
}
