import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Client, type IFrame } from '@stomp/stompjs';

interface SensorReadingCreate {
  temperature: number;
  humidity: number;
  light: number;
  passValue: number;
  sentAt: string;
}

@Component({
  selector: 'app-sensor-reading-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sensor-reading-create.component.html',
  styleUrls: ['./sensor-reading-create.component.scss']
})
export class SensorReadingCreateComponent implements OnDestroy {
  protected isSending = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected readonly createForm = new FormGroup({
    temperature: new FormControl<number | null>(null, Validators.required),
    humidity: new FormControl<number | null>(null, Validators.required),
    light: new FormControl<number | null>(null, Validators.required),
    passValue: new FormControl<number | null>(null, Validators.required),
    sentAt: new FormControl(this.toLocalDateTime(new Date()), Validators.required)
  });

  private client: Client | null = null;

  constructor(private readonly router: Router) {}

  protected createReading(): void {
    if (this.createForm.invalid || this.isSending) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.getRawValue();
    const payload: SensorReadingCreate = {
      temperature: value.temperature!,
      humidity: value.humidity!,
      light: value.light!,
      passValue: value.passValue!,
      sentAt: new Date(value.sentAt!).toISOString()
    };

    this.errorMessage = '';
    this.successMessage = '';
    this.isSending = true;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/sensor-reading',
      reconnectDelay: 0,
      connectionTimeout: 10000,
      onConnect: () => {
        client.publish({
          destination: '/app/sensor-reading',
          body: JSON.stringify(payload),
          headers: { 'content-type': 'application/json' }
        });
        this.isSending = false;
        void client.deactivate().then(() => this.router.navigate(['/']));
      },
      onStompError: (frame: IFrame) => {
        this.handleConnectionError(frame.headers['message'] ?? 'The STOMP broker rejected the request.');
      },
      onWebSocketError: () => {
        this.handleConnectionError('The browser could not connect to the sensor WebSocket backend.');
      },
      onWebSocketClose: () => {
        if (this.isSending) {
          this.handleConnectionError('The WebSocket connection closed before the reading was sent.');
        }
      }
    });

    this.client = client;
    client.activate();
  }

  protected returnToReadings(): void {
    void this.router.navigate(['/sensor-reading']);
  }

  ngOnDestroy(): void {
    void this.client?.deactivate();
  }

  private handleConnectionError(message: string): void {
    this.isSending = false;
    this.errorMessage = message;
    void this.client?.deactivate();
  }

  private toLocalDateTime(date: Date): string {
    const timezoneOffset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }
}
