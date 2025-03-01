import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripsService } from '../../services/trips.service';
import { MatStepperModule, MatStepperNext } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { LocationService } from '../../services/location.service';
import { MapDisplayComponent } from '../map-display/map-display.component';
import { AuthenticatorService } from '../../services/authenticator.service';
import { UserService } from '../../services/user.service';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormsModule } from '@angular/forms';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';
import { MessageService } from '../../services/message.service';
import { Router } from '@angular/router';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
    timeInput: 'HH:mm',  // Parse time format
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
    timeInput: 'HH:mm',  // Display time format
    timeOptionLabel: 'HH:mm',  // Time option label
  },
};

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatTabsModule,
    MapDisplayComponent,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatDatepickerModule,
    FormsModule,
  ],
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class TripComponent implements OnInit, AfterViewInit {
  isLinear = true;
  selectedTabIndex = 0;
  user: any;
  car: string = '';
  nrSeats: number = 1;
  departureDate: Date = new Date();
  departureTime: Date = moment().toDate();
  pricePerPerson: number = 0;

  originFormGroup: FormGroup;
  destinationFormGroup: FormGroup;

  districts: string[] = [];
  municipalities: string[] = [];
  parishes: string[] = [];

  destinationMunicipalities: string[] = [];
  destinationParishes: string[] = [];

  estimatedCost = 0;

  @ViewChild(MapDisplayComponent)
  mapDisplayComponent!: MapDisplayComponent;

  mapLoaded = false;
  distance: number = 0;

  constructor(
    private _formBuilder: FormBuilder,
    private tripsService: TripsService,
    private locationService: LocationService,
    private authService: AuthenticatorService,
    private userProfileService: UserService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router
  ) {

    this.originFormGroup = this._formBuilder.group({
      district: ['', Validators.required],
      municipality: [{ value: '', disabled: true }], // Initially disabled
      parish: [{ value: '', disabled: true }],
    });

    this.destinationFormGroup = this._formBuilder.group({
      district: ['', Validators.required],
      municipality: [{ value: '', disabled: true }], // Initially disabled
      parish: [{ value: '', disabled: true }],
    });
  }

  ngAfterViewInit(): void {
    if (this.mapLoaded) {
      this.accessMapDistance();
    }
  }

  ngOnInit(): void {
    this.loadDistricts();
    this.setupValueChanges();
    const user = this.authService.getUserID();
    if (user) {
      this.userProfileService.getUserByUserID(user).subscribe({
        next: (userData) => {
          this.user = userData;
        },
        error: (error) => {
          console.error('Failed to load user data:', error);
        }
      });
    } else {
      console.error('User ID is null');
    }
  }

  loadDistricts(): void {
    this.locationService.getDistricts().subscribe({
      next: (districts) => {
        this.districts = districts;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Failed to load districts:', error),
    });
  }

  calculateEstimatedCost() {
    this.estimatedCost = this.mapDisplayComponent.distance * 0.4;
  }

  setupValueChanges(): void {
    // Origin District Changes
    this.originFormGroup.get('district')?.valueChanges.subscribe((district) => {
      if (district) {
        this.locationService.getMunicipalities(district).subscribe({
          next: (municipalities) => {
            this.municipalities = municipalities;
            this.originFormGroup.get('municipality')?.enable(); // Enable municipality field
            this.originFormGroup.get('municipality')?.reset(''); // Reset value
            this.originFormGroup.get('parish')?.disable(); // Disable parish until municipality selected
            this.parishes = [];
            this.originFormGroup.get('parish')?.reset(''); // Reset parish field
            this.cdr.detectChanges(); // Trigger change detection
          },
          error: (error) => console.error('Failed to load municipalities:', error),
        });
      } else {
        this.municipalities = [];
        this.parishes = [];
        this.originFormGroup.get('municipality')?.disable(); // Disable municipality if no district selected
        this.originFormGroup.get('parish')?.disable();      // Disable parish
        this.cdr.detectChanges();
      }
    });

    // Origin Municipality Changes
    this.originFormGroup.get('municipality')?.valueChanges.subscribe((municipality) => {
      if (municipality) {
        this.locationService.getParishes(municipality).subscribe({
          next: (parishes) => {
            this.parishes = parishes;
            this.originFormGroup.get('parish')?.enable(); // Enable parish field
            this.originFormGroup.get('parish')?.reset(''); // Reset value
            this.cdr.detectChanges();
          },
          error: (error) => console.error('Failed to load parishes:', error),
        });
      } else {
        this.parishes = [];
        this.originFormGroup.get('parish')?.disable(); // Disable parish if no municipality selected
        this.cdr.detectChanges();
      }
    });

    // Destination District Changes
    this.destinationFormGroup.get('district')?.valueChanges.subscribe((district) => {
      if (district) {
        this.locationService.getMunicipalities(district).subscribe({
          next: (municipalities) => {
            this.destinationMunicipalities = municipalities;
            this.destinationFormGroup.get('municipality')?.enable(); // Enable municipality field
            this.destinationFormGroup.get('municipality')?.reset(''); // Reset value
            this.destinationFormGroup.get('parish')?.disable(); // Disable parish until municipality selected
            this.destinationParishes = [];
            this.destinationFormGroup.get('parish')?.reset('');
            this.cdr.detectChanges();
          },
          error: (error) => console.error('Failed to load municipalities:', error),
        });
      } else {
        this.destinationMunicipalities = [];
        this.destinationParishes = [];
        this.destinationFormGroup.get('municipality')?.disable(); // Disable municipality if no district selected
        this.destinationFormGroup.get('parish')?.disable();      // Disable parish
        this.cdr.detectChanges();
      }
    });

    // Destination Municipality Changes
    this.destinationFormGroup.get('municipality')?.valueChanges.subscribe((municipality) => {
      if (municipality) {
        this.locationService.getParishes(municipality).subscribe({
          next: (parishes) => {
            this.destinationParishes = parishes;
            this.destinationFormGroup.get('parish')?.enable(); // Enable parish field
            this.destinationFormGroup.get('parish')?.reset('');
            this.cdr.detectChanges();
          },
          error: (error) => console.error('Failed to load parishes:', error),
        });
      } else {
        this.destinationParishes = [];
        this.destinationFormGroup.get('parish')?.disable(); // Disable parish if no municipality selected
        this.cdr.detectChanges();
      }
    });
  }

  onTripInfoLoaded() {
    const tripData = {
      driver: this.user.userID,
      car: this.car,
      nrSeats: this.nrSeats,
      estimatedCost: this.estimatedCost,
      pricePerPerson: this.pricePerPerson,
      origin: this.originFormGroup.value,
      destination: this.destinationFormGroup.value,
      departureDate: this.departureDate
    };

    console.log('Trip Data:', tripData);
    this.messageService.showConfirmationDialog('Confirma os dados da viagem?', `Origin: ${tripData.origin.district}, Destination: ${tripData.destination.district}, Departure Date: ${moment(tripData.departureDate).format('DD/MM/YYYY')}, Price per Person: ${tripData.pricePerPerson}`).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.tripsService.createTrip(tripData).subscribe({
            next: (response) => {
                // Navigate to "my trips" page after successful trip creation
                this.router.navigate(['/mytrips']);
              this.messageService.showSnackbar('Viagem criada com sucesso!', 'success');
            },
            error: (error) => {
              console.error('Failed to create trip:', error);
              this.messageService.showSnackbar('Erro ao criar viagem: '+ error.error.error, 'error');
            }
          });
        }
      }
    });
  }

  accessMapDistance(): void {
    if (this.mapDisplayComponent) {
      this.distance = this.mapDisplayComponent.distance;
      this.pricePerPerson = parseFloat(((this.distance * 0.25 + 0.05) / 4).toFixed(2));
    } else {
      console.error('MapDisplayComponent is still undefined');
    }
  }

  goToNextTab(): void {
    if (this.selectedTabIndex < 2) {  // Assuming you have 3 tabs
      this.selectedTabIndex++;
    }
  }

  goToPreviousTab(): void {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
    }
  }
}