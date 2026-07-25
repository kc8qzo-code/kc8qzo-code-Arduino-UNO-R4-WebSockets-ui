import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LatestSensorReadingResponsiveComponent } from './components/latest-sensor-reading/latest-sensor-reading-responsive/latest-sensor-reading-responsive.component';
import { SensorReadingComponent } from './components/sensor-reading/sensor-reading.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SensorReadingEditComponent } from './components/sensor-reading/sensor-reading-edit/sensor-reading-edit.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'latest-sensor-reading', component: LatestSensorReadingResponsiveComponent },
  { path: 'sensor-reading', component: SensorReadingComponent },
  { path: 'readings/:id', component: SensorReadingEditComponent },
  { path: '**', component: NotFoundComponent }
];
