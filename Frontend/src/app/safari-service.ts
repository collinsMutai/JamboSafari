import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define the interface for the Safari Package
export interface SafariPackage {
  title: string;
  includes: string;
  details: string[];
  image: string;
  showDetails: boolean;
  fullDetails: string;
}

@Injectable({
  providedIn: 'root',
})
export class SafariService {
  // State for safari packages, initialized with sample data
  private safariPackagesSubject: BehaviorSubject<SafariPackage[]> = new BehaviorSubject<SafariPackage[]>([
    {
      title: '🗓️ 3-Day Beginners Safari',
      includes: 'Maasai Mara, Lake Nakuru, or Lake Naivasha',
      details: ['Daily game drives', 'Lodges & meals', 'Transfers & guides'],
      image: 'assets/images/cheetah1.jpeg',
      showDetails: false,
      fullDetails:
        'This 3-day safari includes daily game drives through Maasai Mara, Lake Nakuru, and Lake Naivasha, all with luxury lodges, meals, and expert guides.',
    },
    {
      title: '🗓️ 7-Day Classic Safari',
      includes: 'Maasai Mara, Lake Nakuru, Cultural Visit',
      details: ['Daily game drives', 'Lodges & meals', 'Transfers & guides'],
      image: 'assets/images/giraffe1.jpeg',
      showDetails: false,
      fullDetails:
        'This 7-day safari provides an in-depth experience, including visits to Maasai Mara, Lake Nakuru, and a cultural visit to a local Maasai village.',
    },
    {
      title: '🗓️ 10-Day Deluxe Safari + Mission',
      includes: 'Combine safari with service—visit schools, churches, or clinics.',
      details: ['Perfect for youth or mission teams', 'Includes devotionals and worship sessions'],
      image: 'assets/images/lions1.jpeg',
      showDetails: false,
      fullDetails:
        'The 10-day deluxe safari includes not only breathtaking safaris but also mission activities like visiting local schools, churches, and clinics.',
    },
    {
      title: '🗓️ 14-Day Grand Safari',
      includes: 'Kenya & Tanzania combo: Mara, Serengeti, Ngorongoro',
      details: ['Optional 3-day Zanzibar retreat'],
      image: 'assets/images/wilderbeast1.jpeg',
      showDetails: false,
      fullDetails:
        'This is the ultimate safari experience, covering both Kenya and Tanzania with the Mara, Serengeti, Ngorongoro, and an optional 3-day Zanzibar retreat.',
    },
  ]);

  constructor() {}

  // Observable that other components can subscribe to in order to get the current state of safari packages
  getAllPackages(): Observable<SafariPackage[]> {
    return this.safariPackagesSubject.asObservable();
  }

  // Get a single safari package by title
  getPackageByTitle(title: string): Observable<SafariPackage | undefined> {
    return new Observable((observer) => {
      const packageFound = this.safariPackagesSubject.getValue().find(pkg => pkg.title === title);
      observer.next(packageFound);
      observer.complete();
    });
  }

  // Add a new safari package
  addPackage(newPackage: SafariPackage): void {
    const updatedPackages = [...this.safariPackagesSubject.getValue(), newPackage];
    this.safariPackagesSubject.next(updatedPackages);
  }

  // Update an existing safari package
  updatePackage(updatedPackage: SafariPackage): void {
    const updatedPackages = this.safariPackagesSubject.getValue().map(pkg =>
      pkg.title === updatedPackage.title ? updatedPackage : pkg
    );
    this.safariPackagesSubject.next(updatedPackages);
  }

  // Remove a safari package
  deletePackage(title: string): void {
    const updatedPackages = this.safariPackagesSubject.getValue().filter(pkg => pkg.title !== title);
    this.safariPackagesSubject.next(updatedPackages);
  }
}
