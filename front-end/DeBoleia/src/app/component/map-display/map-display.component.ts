import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapDirectionsService } from '@angular/google-maps';
import { BehaviorSubject, map } from 'rxjs';
import { LocationService } from '../../services/location.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-display',
  imports: [
    GoogleMapsModule, 
    CommonModule
  ],
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss']
})
export class MapDisplayComponent implements OnChanges {
  @ViewChild('map', { static: true }) map!: GoogleMap;

  zoom = 6;
  public distance: number = 0;
  center: google.maps.LatLngLiteral = { lat: 41.1579, lng: -8.6291 };

  @Input() from: { parish?: string; municipality?: string; district?: string } = {};
  @Input() to: { parish?: string; municipality?: string; district?: string } = {};

  fromCoords!: google.maps.LatLng;
  toCoords!: google.maps.LatLng;

  markers: { lat: number; lng: number }[] = [];

  directionsResult$ = new BehaviorSubject<google.maps.DirectionsResult | undefined>(undefined);

  constructor(private directionsService: MapDirectionsService, private locationService: LocationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['from'] || changes['to']) {
      this.initializeMap();
    }
  }

  initializeMap() {
    if (this.from && this.to) {
      this.locationService.getCoordinates(this.from).subscribe({
        next: (fromCoordinates) => {
          this.locationService.getCoordinates(this.to).subscribe({
            next: (toCoordinates) => {
              this.fromCoords = new google.maps.LatLng(fromCoordinates.lat, fromCoordinates.lng);
              this.toCoords = new google.maps.LatLng(toCoordinates.lat, toCoordinates.lng);
              this.markers = [fromCoordinates, toCoordinates];
              this.distance = this.locationService.calculateDistance(this.fromCoords, this.toCoords);
              this.getDirections(this.fromCoords, this.toCoords);
            },
            error: (err) => console.error('Error fetching destination coordinates:', err),
          });
        },
        error: (err) => console.error('Error fetching origin coordinates:', err),
      });
    } else {
      console.error('Both `from` and `to` objects must be provided.');
    }
  }

  getDirections(fromLocation: google.maps.LatLng, toLocation: google.maps.LatLng) {
    const request: google.maps.DirectionsRequest = {
      origin: { lat: fromLocation.lat(), lng: fromLocation.lng() },
      destination: { lat: toLocation.lat(), lng: toLocation.lng() },
      travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService
      .route(request)
      .pipe(map((response) => response.result))
      .subscribe({
        next: (res) => {
          if (res && res.routes && res.routes.length > 0) {
            this.directionsResult$.next(res);
          } else {
            this.distance = 0;
            console.error('No valid routes found:', res);
          }
        },
        error: (err) => console.error('Error fetching directions:', err),
      });
  }
}
