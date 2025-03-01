import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { AuthenticatorService } from '../../services/authenticator.service';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-pending-evaluation-dialog',
  templateUrl: './pending-evaluation-dialog.component.html',
  imports: [
    CommonModule,
    StarRatingComponent
  ],
  styleUrls: ['./pending-evaluation-dialog.component.scss'],
})
export class PendingEvaluationDialogComponent {
  pendingPassengerEvaluations: any[];
  pendingDriverEvaluations: any[];

  passengerRatings: { [key: string]: number } = {};  
  driverRatings: { [key: string]: number } = {}; 

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { pendingPassengerEvaluation: any[]; pendingDriverEvaluation: any[] },
    private dialogRef: MatDialogRef<PendingEvaluationDialogComponent>,
    private userService: UserService,
    private auth: AuthenticatorService
  ) {
    this.pendingPassengerEvaluations = data.pendingPassengerEvaluation;
    this.pendingDriverEvaluations = data.pendingDriverEvaluation;
  }

  setPassengerRating(evaluation: any, rating: number): void {
    this.passengerRatings[evaluation.userID] = rating;
    console.log('Avaliação de Passageiro:', rating);
  }

  setDriverRating(evaluation: any, rating: number): void {
    this.driverRatings[evaluation.userID] = rating;
    console.log('Avaliação de Motorista:', rating);
  }

  completePassengerEvaluation(rating: number, evaluatee: string): void {
    console.log('Completing passenger evaluation for:', evaluatee);
    const userId = this.auth.getUserID();
    // const { userID, rating, evaluatorID } = req.body;
    if (userId) {
      const evaluation = {evaluatorID: userId, rating, userID: evaluatee};
      console.log('Evaluation:', evaluation);
      this.userService.rateOnePassenger(evaluation).subscribe({
        next: () => {
          this.pendingPassengerEvaluations = this.pendingPassengerEvaluations.filter(
            (e) => e !== evaluatee
          );

          this.closeDialogIfDone();
        },
        error: (err) => {
          console.error('Error completing passenger evaluation:', err);
        },
      });
    }
  }

  completeDriverEvaluation(rating: number, driver: string): void {
    console.log('Completing driver evaluation for: ', driver);
    const userId = this.auth.getUserID();
    if (userId) {
      this.userService.rateDriver(driver, {rating: rating, evaluatorID: userId}).subscribe({
        next: () => {
          this.pendingDriverEvaluations = this.pendingDriverEvaluations.filter(
            (e) => e !== driver
          );

          this.closeDialogIfDone();
        },
        error: (err) => {
          console.error('Error completing driver evaluation:', err);
        },
      });
    }
  }

  private closeDialogIfDone(): void {
    if (
      this.pendingPassengerEvaluations.length === 0 &&
      this.pendingDriverEvaluations.length === 0
    ) {
      this.dialogRef.close();
    }
  }
}
