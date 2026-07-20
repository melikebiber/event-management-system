import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  ticket_id: number;
  event_id: number;
  ticket_type: string;
  total_quantity: number;
  available_quantity: number;
}

interface TicketResponse {
  success: boolean;
  data: Ticket[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl = 'http://localhost:3000/tickets';

  constructor(private http: HttpClient) {}

  getTicketsByEventId(
    eventId: number | string
  ): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(
      `${this.apiUrl}/event/${eventId}`
    );
  }
}