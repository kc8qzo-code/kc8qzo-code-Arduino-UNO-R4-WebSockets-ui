export interface SensorReadingUpdate {
  temperature: number;
  humidity: number;
  light: number | null;
  passValue: number | null;
  postedAt: string;
}
