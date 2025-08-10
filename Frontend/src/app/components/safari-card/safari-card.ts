import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-safari-card',
  imports: [CommonModule],
  templateUrl: './safari-card.html',
  styleUrls: ['./safari-card.css']
})
export class SafariCard {
  // Define safari packages with title, includes, details, and image URL
  safariPackages = [
    {
      title: "🗓️ 3-Day Beginners Safari",
      includes: "Maasai Mara, Lake Nakuru, or Lake Naivasha",
      details: [
        "Daily game drives",
        "Lodges & meals",
        "Transfers & guides"
      ],
      image: "assets/images/hero4.png" // Add a link to the image for this package
    },
    {
      title: "🗓️ 7-Day Classic Safari",
      includes: "Maasai Mara, Lake Nakuru, Cultural Visit",
      details: [
        "Daily game drives",
        "Lodges & meals",
        "Transfers & guides"
      ],
      image: "assets/images/hero3.png" // Image for this package
    },
    {
      title: "🗓️ 10-Day Deluxe Safari + Mission",
      includes: "Combine safari with service—visit schools, churches, or clinics.",
      details: [
        "Perfect for youth or mission teams",
        "Includes devotionals and worship sessions"
      ],
      image: "assets/images/hero7.png" // Image for this package
    },
    {
      title: "🗓️ 14-Day Grand Safari",
      includes: "Kenya & Tanzania combo: Mara, Serengeti, Ngorongoro",
      details: [
        "Optional 3-day Zanzibar retreat"
      ],
      image: "assets/images/maasai-mara.jpg" // Image for this package
    }
  ];

   bookNow(packageTitle: string) {
    console.log(`Booking for ${packageTitle} initiated.`);
    // You can replace this with actual booking logic, like routing to a booking page or opening a modal
  }

viewDetails(title: any) {
  // Logic to show detailed view, for example, navigate to a detailed page
  console.log('Viewing details for:', title);
  // Or open a modal with detailed info
}


}
