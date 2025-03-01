import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthenticatorService } from '../../services/authenticator.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
	private fb: FormBuilder,
	private userService: UserService,
	private router: Router,
	private authenticatorService: AuthenticatorService,
	private messageService: MessageService
  ) {
	this.changePasswordForm = this.fb.group(
	  {
		oldPassword: ['', Validators.required],
		newPassword: ['', [Validators.required, Validators.minLength(6)]],
		confirmPassword: ['', Validators.required],
	  },
	  { validator: this.passwordMatchValidator }
	);
  }

  get formControls() {
	return this.changePasswordForm.controls;
  }

  passwordMatchValidator(group: FormGroup) {
	const newPassword = group.get('newPassword')?.value;
	const confirmPassword = group.get('confirmPassword')?.value;
	if (newPassword !== confirmPassword) {
	  group.get('confirmPassword')?.setErrors({ mismatch: true });
	  return { mismatch: true };
	}
	group.get('confirmPassword')?.setErrors(null);
	return null;
  }

  onSubmit() {
	this.errorMessage = '';
	this.successMessage = '';

	if (this.changePasswordForm.valid) {
	  const { oldPassword, newPassword, confirmPassword } =
		this.changePasswordForm.value;

	  this.userService
		.changePassword(oldPassword, newPassword, confirmPassword)
		.subscribe({
		  next: () => {
			this.successMessage = 'Password changed successfully!';
			this.messageService.showSnackbar(this.successMessage, 'success');
			this.authenticatorService.logout();
			this.router.navigate(['/login']);
		  },
		  error: (err) => {
			if (err.error && err.error.error) {
			  this.errorMessage = err.error.error;
			  this.messageService.showSnackbar(this.errorMessage, 'error');
			} else {
			  const genericError =
				err.statusText || 'An error occurred during password change.';
			  this.messageService.showSnackbar(genericError, 'error', 5000);
			}
			if (!this.errorMessage) {
			  this.errorMessage = 'Unknown error occurred.';
			}
		  },
		});
	} else {
	  if (this.changePasswordForm.hasError('mismatch')) {
		this.messageService.showSnackbar('Passwords do not match.', 'error');
	  }
	}
  }

  onCancel() {
	const userID = this.authenticatorService.getUserId();
	if (userID) {
	  this.router.navigate([`/user/${userID}`]);
	} else {
	  this.router.navigate(['/profile']);
	}
  }
}
