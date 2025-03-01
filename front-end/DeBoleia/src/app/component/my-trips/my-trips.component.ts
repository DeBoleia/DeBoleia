import { Component, OnInit } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';
import { AuthenticatorService } from '../../services/authenticator.service';
import {MatTabsModule} from '@angular/material/tabs';
import { TripsService } from '../../services/trips.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { AplicationCardComponent } from '../aplication-card/aplication-card.component';
import { StarRatingComponent } from "../star-rating/star-rating.component";
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ManageTripComponent } from '../manage-trip/manage-trip.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationsService } from '../../services/applications.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-my-trips',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatButton,
    AplicationCardComponent,
    MatIconModule,
],
  templateUrl: './my-trips.component.html',
  styleUrl: './my-trips.component.scss'
})
export class MyTripsComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticatorService,
    private userService: UserService,
    private messageService: MessageService,
    private tripService: TripsService,
    private applicationService: ApplicationsService,
    private dialog: MatDialog
  ) { }

  user: any = undefined;
  tripsAsDriver: any[] = [];
  tripsAsDriverDataSource: any;
  tripsAsPassenger: any[] = [];
  tripsAsPassengerDataSource: any;
  myApplications: any[] = [];

  ngOnInit(): void {
    const userID =  this.authenticationService.getUserID();
    if (userID) {
      this.userService.getUserByUserID(userID).subscribe(user => {
        this.user = user;
        console.log('user: ', this.user);

        forkJoin({
          tripsAsDriver: this.tripService.getTripsByDriver(userID).pipe(catchError(error => {
            console.error('Error fetching trips as driver', error);
            return of([]);
          })),
          tripsAsPassenger: this.tripService.getTripsByPassenger(userID).pipe(catchError(error => {
            console.error('Error fetching trips as passenger', error);
            return of([]);
          })),
          myApplications: this.applicationService.getApplicationByUserID(userID).pipe(catchError(error => {
            console.error('Error fetching all applications', error);
            return of([]);
          }))
        }).subscribe(({ tripsAsDriver, tripsAsPassenger, myApplications }) => {
          this.tripsAsDriver = tripsAsDriver;
          this.tripsAsDriverDataSource = new MatTableDataSource(this.tripsAsDriver);


          this.tripsAsPassenger = tripsAsPassenger;
          this.tripsAsPassengerDataSource = new MatTableDataSource(this.tripsAsPassenger);
          
          this.myApplications = myApplications;
        });
      });
    }
  }

  cancelRide(tripCode: string) {
    this.tripService.removePassengerFromTrip(tripCode, this.user.userID).subscribe(() => {
      this.messageService.showSnackbar('Ride cancelled successfully');
      this.ngOnInit();
    });
  }

  manageTrip(tripCode: string) {
      ManageTripComponent.openDialog(this.dialog, { tripCode: tripCode });
    }

  
    trackApplication(index: number, application: any): any {

      return application.applicationCode;
  
    }
}
