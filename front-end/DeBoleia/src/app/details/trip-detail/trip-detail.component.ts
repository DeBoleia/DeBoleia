import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list'
import { GoogleMapsModule, MapDirectionsService } from '@angular/google-maps';
import { MapDisplayComponent } from "../../component/map-display/map-display.component";
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import { TripsService } from '../../services/trips.service';
import { AuthenticatorService } from '../../services/authenticator.service';
import { ApplicationsService } from '../../services/applications.service';
import { MessageService } from '../../services/message.service';
import { StarRatingComponent } from '../../component/star-rating/star-rating.component';



@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule,
    MatGridListModule,
    GoogleMapsModule,
    MapDisplayComponent,
    MatIcon,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    StarRatingComponent
],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.scss'
})

export class TripDetailComponent implements OnInit {
  trip!: any;
  tripCode!: string | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {tripCode: string},
    private tripService: TripsService,
    private dialogRef: MatDialogRef<TripDetailComponent>,
    private authenticatorService: AuthenticatorService,
    private applicationService: ApplicationsService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.tripCode = this.data?.tripCode;
    this.loadData();
  }


  loadData() {
    if (!this.tripCode) {
      this.trip = this.createGenericTrip();
      console.log(this.trip);
      return;
    }

    this.tripService.getTripByTripCode(this.tripCode).subscribe((trip: any) => {
      this.trip = trip || this.createGenericTrip();
      console.log(this.trip);
    });
  }

  applyToTrip() {
    const userID = this.authenticatorService.getUserID();
    this.applicationService.createApplication(userID, this.tripCode).subscribe({
      next: (application: any) => {
        console.log(application);
        this.dialogRef.close();
        this.messageService.showSnackbar('Application successful!', 'success', 3000);
      },
      error: (error: any) => {
        console.error(error);
        this.messageService.showSnackbar('Application failed: ' + error.error.message, 'error');
      }
    });
  }


  static openDialog(dialog: MatDialog, data?: {tripCode: string}): MatDialogRef<TripDetailComponent> {
    return dialog.open(TripDetailComponent, {
      minWidth: '1000px',
      autoFocus: false,
      disableClose: true,
      data: data
    });
  }

  private createGenericTrip() {
    return {
      tripCode: "N/A",
      status: "N/A",
      nrSeats: 0,
      estimatedCost: 0,
      pricePerPerson: 0,
      origin: {
        municipality: "N/A",
        parish: null,
        district: "N/A",
      },
      destination: {
        municipality: "N/A",
        parish: null,
        district: "N/A",
      },
      departureDate: 0,
      car: {
        brand: "N/A",
        model: "N/A",
        color: "N/A",
        licensePlate: "N/A"
      },
      driver: {
        name: "N/A",
        phoneNumber: "N/A",
        driverRating: 0,
        driverRatingCount: 0
      },
      passengers: []
    };
  }
}
