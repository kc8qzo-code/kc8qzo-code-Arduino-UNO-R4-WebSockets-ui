import type { SensorReadingResponse } from './sensor-reading-response.model';

export interface SensorReadingPageResponse {
  content?: SensorReadingResponse[];
  number?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}
