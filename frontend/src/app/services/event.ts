import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventResponse } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = 'http://localhost:3000/events';

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<EventResponse> {
    return this.http.get<EventResponse>(this.apiUrl);
  }
}