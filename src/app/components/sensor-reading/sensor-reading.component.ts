import { Component } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';

import type { PaginatedSensorReadings } from '../../models/paginated-sensor-readings.model';
import { SensorReadingService } from '../../services/sensor-reading.service';

@Component({
  selector: 'app-sensor-reading',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, RouterLink],
  templateUrl: './sensor-reading.component.html',
  styleUrls: ['./sensor-reading.component.scss']
})
export class SensorReadingComponent {
  private readonly pageSize = 5;
  private readonly pageIndex$ = new BehaviorSubject(0);

  protected readonly sensorReadings$;
  protected errorMessage = '';

  constructor(private readonly sensorReadingService: SensorReadingService) {
    this.sensorReadings$ = this.pageIndex$.pipe(
      switchMap((pageIndex) =>
        this.sensorReadingService.getSensorReadings(pageIndex, this.pageSize).pipe(
          catchError((error: unknown) => {
            this.errorMessage = this.getErrorMessage(error);
            return of(this.createEmptyPage(pageIndex));
          })
        )
      )
    );
  }

  protected goToPreviousPage(currentPage: number): void {
    if (currentPage > 0) {
      this.errorMessage = '';
      this.pageIndex$.next(currentPage - 1);
    }
  }

  protected goToNextPage(currentPage: number, totalPages: number): void {
    if (currentPage + 1 < totalPages) {
      this.errorMessage = '';
      this.pageIndex$.next(currentPage + 1);
    }
  }

  private createEmptyPage(page: number): PaginatedSensorReadings {
    return {
      items: [],
      page,
      pageSize: this.pageSize,
      totalItems: 0,
      totalPages: 1
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'The browser could not reach the sensor API. If Postman works, this is usually a CORS or network access issue.';
      }

      return `The sensor API request failed with status ${error.status}.`;
    }

    if (error instanceof Error) {
      return `The sensor readings could not be processed: ${error.message}`;
    }

    if (typeof error === 'string') {
      return `The sensor readings could not be processed: ${error}`;
    }

    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status?: unknown }).status;
      if (typeof status === 'number') {
        return `The sensor API request failed with status ${status}.`;
      }
    }

    return 'The sensor readings request failed for an unknown reason.';
  }
}
