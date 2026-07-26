import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LatestSensorReadingComponent } from '../latest-sensor-reading.component';
import { LatestSensorReadingMobileComponent } from '../latest-sensor-reading-mobile/latest-sensor-reading-mobile.component';

@Component({
  selector: 'app-latest-sensor-reading-responsive',
  imports: [LatestSensorReadingComponent, LatestSensorReadingMobileComponent],
  templateUrl: './latest-sensor-reading-responsive.component.html'
})

export class LatestSensorReadingResponsiveComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Observe Material Design handset sizes. This signal evaluates to true on mobile devices.
  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );
}
