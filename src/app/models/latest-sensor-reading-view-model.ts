import { SensorReading } from "./sensor-reading.model";

interface LatestSensorReadingViewModel {
  reading: SensorReading | null;
  polledAt: Date;
}
