import { Component, input, Input } from '@angular/core';
import { AuthenticatorService } from '../../services/authenticator.service';
import { MessageService } from '../../services/message.service';
import { ApplicationsService } from '../../services/applications.service';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { StarRatingComponent } from "../star-rating/star-rating.component";
import { catchError, forkJoin, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { TripsService } from '../../services/trips.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-aplication-card',
  imports: [
    MatCardModule,
    CommonModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    StarRatingComponent,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './aplication-card.component.html',
  styleUrl: './aplication-card.component.scss'
})
export class AplicationCardComponent {

  constructor(
    private authenticationService: AuthenticatorService,
    private messageService: MessageService,
    private applicationService: ApplicationsService,
    private userService: UserService,
    private tripsService: TripsService
  ) { }

  @Input() applicationCode: string = '';
  @Input() user: string = '';
  @Input() isDriver: boolean = false;
  application: any;
  trip: any;

  loadData() {
    this.applicationService.getApplicationByApplicationCode(this.applicationCode).pipe(
      catchError(error => {
      console.error('Error fetching application:', error);
      return of(null);
      })
    ).subscribe(application => {
      if (application) {
      this.application = application;
      console.log('application: ', this.application);

      forkJoin({
        trip: this.tripsService.getTripByTripCode(this.application.trip.tripCode).pipe(
        catchError(error => {
          console.error('Error fetching trip:', error);
          return of(null);
        })
        )
      }).subscribe(({ trip }) => {
        this.trip = trip;
        console.log('trip: ', this.trip);
      });
      }
    });
  }
   acceptPassenger(userID: string) {
      this.tripsService.addPassengerToTrip(this.application.trip.tripCode, userID).subscribe (data => {
        this.loadData();
      });
  }

  rejectPassenger(userID: string) {
    this.applicationService.rejectApplication(this.application.applicationCode).subscribe (data => {
      this.loadData();
    });
  }

  cancelApplication() {
    this.applicationService.cancelApplication(this.application.applicationCode).subscribe (data => {
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }
}

// "applicationCode": "4DOG93",
// "status": "underReview",
// "applicationDate": "2025-01-22T10:29:16.415Z",
// "trip": "656CEJ",
// "user": {
//     "name": "lika",
//     "passengerRating": 2.5,
//     "passengerRatingCount": 1
// }