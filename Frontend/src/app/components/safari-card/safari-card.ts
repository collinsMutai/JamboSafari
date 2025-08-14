import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-safari-card',
  templateUrl: './safari-card.html',
  styleUrls: ['./safari-card.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SafariCard {
  safariPackages = [
    {
      title: "🗓️ 3-Day Beginners Safari",
      includes: "Maasai Mara, Lake Nakuru, or Lake Naivasha",
      details: [
        "Daily game drives",
        "Lodges & meals",
        "Transfers & guides"
      ],
      image: "assets/images/cheetah1.jpeg",
      showDetails: false,
    },
    {
      title: "🗓️ 7-Day Classic Safari",
      includes: "Maasai Mara, Lake Nakuru, Cultural Visit",
      details: [
        "Daily game drives",
        "Lodges & meals",
        "Transfers & guides"
      ],
      image: "assets/images/giraffe1.jpeg",
      showDetails: false,
    },
    {
      title: "🗓️ 10-Day Deluxe Safari + Mission",
      includes: "Combine safari with service—visit schools, churches, or clinics.",
      details: [
        "Perfect for youth or mission teams",
        "Includes devotionals and worship sessions"
      ],
      image: "assets/images/lions1.jpeg",
      showDetails: false,
    },
    {
      title: "🗓️ 14-Day Grand Safari",
      includes: "Kenya & Tanzania combo: Mara, Serengeti, Ngorongoro",
      details: [
        "Optional 3-day Zanzibar retreat"
      ],
      image: "assets/images/wilderbeast1.jpeg",
      showDetails: false,
    }
  ];

  // Track which package's details are visible
  selectedPackageDetails: string | null = null;

  // Open the modal with details
  openModal(packageTitle: string) {
    this.selectedPackageDetails = packageTitle;
  }

  // Close the modal
  closeModal() {
    this.selectedPackageDetails = null;
  }

  bookNow(packageTitle: string) {
    console.log(`Booking for ${packageTitle} initiated.`);
    // Add logic for booking here
  }
}
