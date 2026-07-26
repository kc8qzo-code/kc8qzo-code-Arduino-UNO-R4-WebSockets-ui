import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { PaginatedSensorReadings } from '../models/paginated-sensor-readings.model';
import type { SensorReading } from '../models/sensor-reading.model';
import type { SensorReadingPageResponse } from '../models/sensor-reading-page-response.model';
import type { SensorReadingResponse } from '../models/sensor-reading-response.model';
import type { SensorReadingUpdate } from '../models/sensor-reading-update.model';

@Injectable({
  providedIn: 'root'
})
export class SensorReadingService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/sensors`;

  constructor(private readonly http: HttpClient) {}

  getSensorReadings(page = 0, pageSize = 10): Observable<PaginatedSensorReadings> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', pageSize);

    return this.http
      .get<SensorReadingResponse[] | SensorReadingPageResponse>(`${this.apiUrl}/readings`, { params })
      .pipe(
        map((response) => this.toPaginatedResult(response, page, pageSize))
      );
  }

  getLatestSensorReading(): Observable<SensorReading | null> {
    return this.http.get<SensorReadingResponse>(`${this.apiUrl}/latest`).pipe(
      map((response) => this.toSensorReading(response, 0))
    );
  }

  getSensorReading(id: bigint): Observable<SensorReading> {
    return this.http
      .get<SensorReadingResponse>(`${this.apiUrl}/readings/${id.toString()}`)
      .pipe(map((response) => this.toSensorReading(response, 0)));
  }

  private toPaginatedResult(
    response: SensorReadingResponse[] | SensorReadingPageResponse,
    page: number,
    pageSize: number
  ): PaginatedSensorReadings {
    if (Array.isArray(response)) {
      const startIndex = page * pageSize;
      const items = response
        .slice(startIndex, startIndex + pageSize)
        .map((reading, index) => this.toSensorReading(reading, startIndex + index));

      return {
        items,
        page,
        pageSize,
        totalItems: response.length,
        totalPages: Math.max(1, Math.ceil(response.length / pageSize))
      };
    }

    const content = response.content ?? [];
    const resolvedPage = response.number ?? page;
    const resolvedPageSize = response.size ?? pageSize;
    const totalItems = response.totalElements ?? content.length;
    const totalPages = response.totalPages ?? Math.max(1, Math.ceil(totalItems / resolvedPageSize));

    return {
      items: content.map((reading, index) =>
        this.toSensorReading(reading, resolvedPage * resolvedPageSize + index)
      ),
      page: resolvedPage,
      pageSize: resolvedPageSize,
      totalItems,
      totalPages
    };
  }

  private toSensorReading(reading: SensorReadingResponse, index: number): SensorReading {
    return {
      id: this.toSensorId(reading.id, index),
      temperature: reading.temperature,
      humidity: reading.humidity,
      light: reading.light,
      passValue: reading.passValue,
      postedAt: new Date(reading.postedAt)
    };
  }

  private toSensorId(id: SensorReadingResponse['id'], index: number): bigint {
    if (id === null || id === undefined) {
      return BigInt(index + 1);
    }

    return BigInt(id);
  }

  updateSensorReading(id: bigint, changes: SensorReadingUpdate): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/readings/${id.toString()}`, changes);
  }
}
