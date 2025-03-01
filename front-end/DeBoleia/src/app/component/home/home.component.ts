import { Component } from '@angular/core';
import { TripDetailComponent } from '../../details/trip-detail/trip-detail.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {

  constructor(
    private dialog: MatDialog
  ) { }

  tripDetails() {
   TripDetailComponent.openDialog(this.dialog);
  }

}