import { Component, Inject, OnInit } from '@angular/core';
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogRef,
} from '@angular/material/dialog';
import { EmailValidator, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interfaces/user';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/select';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogContent } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../services/user.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import moment from 'moment';

export const CUSTOM_DATE_FORMATS = {
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
	display: {
		dateInput: 'DD/MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'DD/MM/YYYY',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: 'app-user-dialog',
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatFormField,
		MatDatepicker,
		MatDatepickerModule,
		MatDialogContent,
		ReactiveFormsModule,
		MatNativeDateModule,
		CommonModule,
		MatSelectModule,
		MatInputModule,
		MatButtonModule,
		MatCheckboxModule,
	],
	providers: [
		{ provide: DateAdapter, useClass: MomentDateAdapter },
		{ provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
	],
	templateUrl: './edit-user.component.html',
	styleUrls: ['./edit-user.component.scss'],
})
export class UserDialogComponent implements OnInit {
	userForm!: FormGroup;
	isEditing: boolean = false;
	showWarning: boolean = false;
	initialStatus: string = '';
	pendingStatus: string | null = null;
	newStatus: string = '';

	constructor(
		private fb: FormBuilder,
		private dialogRef: MatDialogRef<UserDialogComponent>,
		private userService: UserService,
		@Inject(MAT_DIALOG_DATA) public data: { user?: User }
	) {}

	ngOnInit(): void {
		this.isEditing = !!this.data.user;
		this.initForm();
	}

	initForm(): void {
		const status =
			this.data.user?.status &&
			(this.data.user.status.toLowerCase() === 'active')
				? 'active'
				: 'inactive';

		console.log('INITFORM STATUS: ', status);

		this.userForm = this.fb.group({
			name: [this.data.user?.name || '', Validators.required],
			email: [this.data.user?.email || '', [emailValidator()]],
			phoneNumber: [
				this.data.user?.phoneNumber || '',
				[phoneNumberValidator()],
			],
			NIF: [this.data.user?.NIF || '', [NIFValidator()]],
			birthDate: [
				this.data.user?.birthDate || '',
				[ageValidator()],
			],
			driversLicense: [this.data.user?.driversLicense || '', [driversLicenseValidator()] ],
			role: [
				{
					value: this.data.user?.role || '',
					disabled: !this.isEditing,
				},
			],

		});

		this.initialStatus = status;
		this.newStatus = status; 
	}

	onStatusChange(value: string): void {
		this.showWarning = value === 'inactive';
	}


	onSubmit(): void {
		if (this.userForm.valid) {

			const name = this.userForm.get('name')?.value;
			const capitalizedName = this.capitalizeFirstLetter(name);
	
			this.userForm.patchValue({ name: capitalizedName });
	
			this.dialogRef.close(this.userForm.value);
		}
	}
	
	capitalizeFirstLetter(name: string): string {
		return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
	}

	onCancel(): void {
		this.userForm.reset();
		this.dialogRef.close();
	}
}

export function emailValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const email = control.value;
		const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		return emailPattern.test(email) ? null : { invalidEmail: true };
	};
}

export function phoneNumberValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const phoneNumber = control.value;
		const phonePattern = /^[0-9]{9}$/;
		return phonePattern.test(phoneNumber) ? null : { invalidPhoneNumber: true };
	};
}

export function NIFValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const NIF = control.value;
		const NIFPattern = /^[0-9]{9}$/;
		return NIFPattern.test(NIF) ? null : { invalidNIF: true };
	};
}

export function driversLicenseValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		let license = control.value;

		if (!license) {
			return null;
		}
		const upperCaseLicense = license.toUpperCase();
		
		if (license !== upperCaseLicense) {
			control.setValue(upperCaseLicense, { emitEvent: false });
		}

		const licensePattern = /^L\d{7}$/;

		return licensePattern.test(upperCaseLicense) ? null : { invalidLicense: true };
	};
}


export function ageValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const birthDate = control.value;

		console.log('Raw birthDate value:', birthDate);

		const birthDateMoment = moment.isMoment(birthDate)
			? birthDate
			: moment(birthDate, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);

		console.log('Parsed birthDate:', birthDateMoment.format('DD/MM/YYYY'));
		console.log('Is valid date:', birthDateMoment.isValid());

		if (!birthDateMoment.isValid()) {
			console.log('Invalid birth date detected');
			return { invalidDate: true };
		}

		const today = moment();
		const age = today.diff(birthDateMoment, 'years');

		console.log('Calculated age:', age);
		console.log('Age validation:', age >= 18 ? 'Valid' : 'Underage');

		return age >= 18 ? null : { underage: true };
	};
}