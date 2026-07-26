export interface SensorReadingResponse {
  id?: string | number | bigint | null;
  temperature: number;
  humidity: number;
  light: number | null;
  passValue: number | null;
  postedAt: string;
}
