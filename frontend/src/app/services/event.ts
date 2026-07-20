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

  // Tüm etkinlikleri getirir
  getAllEvents(): Observable<EventResponse> {
    return this.http.get<EventResponse>(this.apiUrl);
  }

  // ID'ye göre tek bir etkinliği getirir
  getEventById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}