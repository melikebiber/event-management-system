import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RegistrationRequest {
  user_id: number;
  event_id: number;
  ticket_id: number;
}

interface RegistrationResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  remaining_ticket_quantity?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  private apiUrl = 'http://localhost:3000/registrations';

  constructor(private http: HttpClient) {}

  createRegistration(
    registrationData: RegistrationRequest
  ): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      this.apiUrl,
      registrationData
    );
  }
}