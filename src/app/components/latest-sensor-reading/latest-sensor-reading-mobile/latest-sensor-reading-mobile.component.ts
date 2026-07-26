import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, map, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SensorReadingService } from '../../../services/sensor-reading.service';

@Component({
  selector: 'app-latest-sensor-reading-mobile',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './latest-sensor-reading-mobile.component.html',
  styleUrl: './latest-sensor-reading-mobile.component.scss'
})
export class LatestSensorReadingMobileComponent {

  constructor(private readonly sensorReadingService: SensorReadingService) {}

  protected errorMessage = '';

  // Poll the latest sensor reading every 2 seconds
  protected readonly latestSensorReading = timer(0, 2000).pipe(
    switchMap(() =>
      this.sensorReadingService.getLatestSensorReading().pipe(
        map((reading) => {
          this.errorMessage = '';

          return {
            reading,
            polledAt: new Date()
          };
        }),
        catchError((error: unknown) => {
          this.errorMessage = this.getErrorMessage(error);

          return of({
            reading: null,
            polledAt: new Date()
          });
        })
      )
    )
  );

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'The browser could not reach the sensor API. If Postman works, this is usually a CORS or network access issue.';
      }

      return `The sensor API request failed with status ${error.status}.`;
    }

    if (error instanceof Error) {
      return `The latest sensor reading could not be processed: ${error.message}`;
    }

    if (typeof error === 'string') {
      return `The latest sensor reading could not be processed: ${error}`;
    }

    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status?: unknown }).status;
      if (typeof status === 'number') {
        return `The sensor API request failed with status ${status}.`;
      }
    }

    return 'The latest sensor reading request failed for an unknown reason.';
  }
}
