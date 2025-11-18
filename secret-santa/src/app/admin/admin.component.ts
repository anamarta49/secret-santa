import { Component, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  adminKey = signal('');
  authenticated = signal(false);
  participants = signal<any[]>([]);
  loading = signal(false);
  message = signal('');

  constructor(private http: HttpClient) {}

  login() {
    if (!this.adminKey()) { this.message.set('Enter admin key'); return; }
    this.authenticated.set(true);
    this.message.set('');
    this.fetchParticipants();
  }

  fetchParticipants() {
    this.loading.set(true);
    const headers = new HttpHeaders({ 'X-Admin-Key': this.adminKey() });
    this.http.get<any[]>('/.netlify/functions/list', { headers }).subscribe({
      next: data => { this.participants.set(data); this.loading.set(false); },
      error: (error) => { 
        console.error(error);
        
        if (error.statusCode === 401) {
          this.message.set('Key was not recognized'); 
          this.authenticated.set(false);
        } else {
          this.message.set('Failed to load participants'); 
        }
        this.loading.set(false); 
      }
    });
  }

  sendAssignments() {
    this.loading.set(true);
    const headers = new HttpHeaders({ 'X-Admin-Key': this.adminKey() });
    this.http.post('/.netlify/functions/assign', {}, { headers }).subscribe({
      next: () => { this.message.set('Assignments sent successfully'); this.loading.set(false); },
      error: () => { this.message.set('Failed to send assignments'); this.loading.set(false); }
    });
  }
}
