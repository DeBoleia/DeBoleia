import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-message',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		FormsModule,
		MatInput,
		MatInputModule
	],
	templateUrl: './message.component.html',
	styleUrl: './message.component.scss'
})
export class MessageComponent {
	inputCode: string = '';
	isCodeValid: boolean = false;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<MessageComponent>
	) {
		if (this.data.initialBrandName) {
			this.inputCode = this.data.initialBrandName;
		}
	}

	onConfirm(): void {
		if (this.data.requiresCodeInput) {
			if (this.inputCode.trim() === '') {
				return;
			}
			this.dialogRef.close(this.inputCode.trim());
		} else {
			this.dialogRef.close(true);
		}
	}

	onClose(): void {
		this.dialogRef.close(null);
	}

	validateCode(): void {
		this.isCodeValid = this.inputCode.trim() !== '';
	}
}