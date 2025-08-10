import { Component } from '@angular/core';

import { DestinationAndHighlightsComponent } from '../destination-and-highlights/destination-and-highlights';

import { HeroCarousel } from '../hero-carousel/hero-carousel';
import { AboutUs } from '../about-us/about-us';
import { SafariCard } from "../safari-card/safari-card";

@Component({
  selector: 'app-home',
  imports: [DestinationAndHighlightsComponent, HeroCarousel, AboutUs, SafariCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
