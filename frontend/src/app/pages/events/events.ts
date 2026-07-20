import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EventService } from '../../services/event';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  events: Event[] = [];
  filteredEvents: Event[] = [];

  selectedCategory = '';
  selectedCity = '';
  selectedDate = '';

  categories: string[] = [];
  cities: string[] = [];

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.events = response.data;
        this.filteredEvents = response.data;

        this.createFilterOptions();

        console.log('Etkinlikler:', this.events);
      },
      error: (error: unknown) => {
        console.error('Etkinlikler alınamadı:', error);
      }
    });
  }

  createFilterOptions(): void {
    this.categories = [
      ...new Set(
        this.events.map(
          event => event.category.category_name
        )
      )
    ];

    this.cities = [
      ...new Set(
        this.events.map(
          event => event.location.city
        )
      )
    ];
  }

  filterEvents(): void {
    this.filteredEvents = this.events.filter(event => {

      const categoryMatches =
        this.selectedCategory === '' ||
        event.category.category_name === this.selectedCategory;

      const cityMatches =
        this.selectedCity === '' ||
        event.location.city === this.selectedCity;

      const dateMatches =
        this.selectedDate === '' ||
        event.event_date === this.selectedDate;

      return categoryMatches && cityMatches && dateMatches;
    });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedCity = '';
    this.selectedDate = '';

    this.filteredEvents = this.events;
  }

  goToEventDetail(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }
}