import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgOptimizedImage],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = signal('');
  email = signal('');
  message = signal('');
  loading = signal(false);
  submitted = signal(false);

  constructor(private http: HttpClient) {}

  submit() {
    if (!this.name() || !this.email()) {
      this.message.set('Please enter name and email.');
      return;
    }

    this.loading.set(true);
    this.http.post('/.netlify/functions/register', {
      name: this.name(),
      email: this.email()
    }).subscribe({
      next: () => {
        this.message.set('Registration successful! Check your email.');
        this.loading.set(false);
        this.name.set('');
        this.email.set('');
        this.submitted.set(true);
      },
      error: () => {
        this.message.set('Registration failed.');
        this.loading.set(false);
      }
    });
  }
}
