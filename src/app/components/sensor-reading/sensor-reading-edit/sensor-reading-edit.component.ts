import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { SensorReading } from '../../../models/sensor-reading.model';
import type { SensorReadingUpdate } from '../../../models/sensor-reading-update.model';
import { SensorReadingService } from '../../../services/sensor-reading.service';

@Component({
  selector: 'app-sensor-reading-edit',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './sensor-reading-edit.component.html',
  styleUrls: ['./sensor-reading-edit.component.scss']
})
export class SensorReadingEditComponent implements OnInit {
  protected reading: SensorReading | null = null;
  protected postedAt!: Date;
  protected errorMessage = '';
  protected successMessage = '';
  protected isLoading = true;
  protected isSaving = false;

  protected readonly editForm = new FormGroup({
    temperature: new FormControl<number | null>(null, [Validators.required]),
    humidity: new FormControl<number | null>(null, [Validators.required]),
    light: new FormControl<number | null>(null),
    passValue: new FormControl<number | null>(null)
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sensorReadingService: SensorReadingService
  ) {}

  ngOnInit(): void {
    const id = this.readRouteId();
    if (id === null) {
      this.errorMessage = 'The sensor reading ID is invalid.';
      this.isLoading = false;
      return;
    }

    const selectedReading = history.state?.reading as SensorReading | undefined;
    if (selectedReading && BigInt(selectedReading.id) === id) {
      this.setReading({ ...selectedReading, id: BigInt(selectedReading.id) });
      return;
    }

    this.sensorReadingService.getSensorReading(id).subscribe({
      next: (reading) => this.setReading(reading),
      error: (error: unknown) => {
        this.errorMessage = this.getErrorMessage(error, 'load');
        this.isLoading = false;
      }
    });
  }

  protected save(): void {
    if (!this.reading || this.editForm.invalid || this.isSaving) {
      this.editForm.markAllAsTouched();
      return;
    }

    const value = this.editForm.getRawValue();

    const changes: SensorReadingUpdate = {
      temperature: value.temperature!,
      humidity: value.humidity!,
      light: value.light,
      passValue: value.passValue,
      postedAt: this.postedAt.toISOString()
    };

    this.errorMessage = '';
    this.successMessage = '';
    this.isSaving = true;

    this.sensorReadingService.updateSensorReading(this.reading.id, changes).subscribe({
      next: () => {
        this.isSaving = false;
        void this.router.navigate(['/sensor-reading']);
      },
      error: (error: unknown) => {
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(error, 'update');
      }
    });
  }

  protected returnToReadings(): void {
    void this.router.navigate(['/sensor-reading']);
  }

  private setReading(reading: SensorReading): void {
    this.reading = reading;
    this.postedAt = new Date(reading.postedAt);

    this.editForm.setValue({
      temperature: reading.temperature,
      humidity: reading.humidity,
      light: reading.light,
      passValue: reading.passValue
    });
    this.isLoading = false;
  }

  private readRouteId(): bigint | null {
    try {
      return BigInt(this.route.snapshot.paramMap.get('id') ?? '');
    } catch {
      return null;
    }
  }

  private getErrorMessage(error: unknown, action: 'load' | 'update'): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'The browser could not reach the sensor API.';
      }
      return `The sensor reading could not be ${action === 'load' ? 'loaded' : 'updated'} (status ${error.status}).`;
    }
    return `The sensor reading could not be ${action === 'load' ? 'loaded' : 'updated'}.`;
  }
}
