import { Component, Inject } from '@angular/core';
import {
	MatSnackBarRef,
	MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
@Component({
	selector: 'app-delete-confirmation-snackbar',
	standalone: true,
	imports: [MatButtonModule, CommonModule],
	template: `
		<div
			style="display: flex; flex-direction: column; align-items: flex-start; width: 100%; padding: 10px;"
		>
			<span style="margin-bottom: 15px;">{{ data.message }}</span>
			<div
				style="display: flex; gap: 10px; justify-content: center; width: 100%;"
			>
				<button
					mat-raised-button
					color="primary"
					(click)="confirm()"
					class="confirm-button"
				>
					Yes
				</button>
				<button
					mat-raised-button
					color="warn"
					(click)="cancel()"
					class="cancel-button"
				>
					No
				</button>
			</div>
		</div>
	`,
	styles: [
		`
			.confirm-button,
			.cancel-button {
				min-width: 80px;
			}
		`,
	],
})
export class DeleteConfirmationSnackbarComponent {
	constructor(
		@Inject(MAT_SNACK_BAR_DATA) public data: { message: string },
		public snackBarRef: MatSnackBarRef<DeleteConfirmationSnackbarComponent>
	) {}

	confirm(): void {
		this.snackBarRef.dismissWithAction();
	}

	cancel(): void {
		this.snackBarRef.dismiss();
	}
}
