import type { SensorReading } from './sensor-reading.model';

export interface PaginatedSensorReadings {
  items: SensorReading[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
