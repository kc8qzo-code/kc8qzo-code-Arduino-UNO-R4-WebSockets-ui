import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LatestSensorReadingResponsiveComponent } from './components/latest-sensor-reading/latest-sensor-reading-responsive/latest-sensor-reading-responsive.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SensorReadingEditComponent } from './components/sensor-reading/sensor-reading-edit/sensor-reading-edit.component';
import { SensorReadingCreateComponent } from './components/sensor-reading/sensor-reading-create/sensor-reading-create.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'latest-sensor-reading', component: LatestSensorReadingResponsiveComponent },
  { path: 'sensor-reading/create', component: SensorReadingCreateComponent },
  { path: 'readings/:id', component: SensorReadingEditComponent },
  { path: '**', component: NotFoundComponent }
];
