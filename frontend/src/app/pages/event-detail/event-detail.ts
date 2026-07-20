import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { EventService } from '../../services/event';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail implements OnInit {

  event: Event | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');

    if (!eventId) {
      this.errorMessage = 'Etkinlik ID bilgisi bulunamadı.';
      this.isLoading = false;
      return;
    }

    this.getEventDetail(eventId);
  }

  getEventDetail(eventId: string): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        this.event = response.data;
        this.isLoading = false;
        this.errorMessage = '';

        console.log('Etkinlik detayı:', this.event);

        this.changeDetector.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Etkinlik detayı alınamadı:', error);

        this.event = null;
        this.errorMessage = 'Etkinlik bilgileri alınamadı.';
        this.isLoading = false;

        this.changeDetector.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }
}