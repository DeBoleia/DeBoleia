import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticatorService } from '../../services/authenticator.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';

interface LoginResponse {
	userToken?: string;
	error?: string;
}

@Component({
	selector: 'app-login',
	standalone: true,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	imports: [
		ReactiveFormsModule,
		CommonModule,
		MatButtonModule
	]
})
export class LoginComponent {
	loginForm: FormGroup;
	errorMessage: string | null = null;
	isAccountInactive: boolean = false;

	constructor(
		private fb: FormBuilder,
		private authenticatorService: AuthenticatorService,
		private router: Router,
		private messageService: MessageService,
		private userService: UserService,
	) {
		this.loginForm = this.fb.group({
			email: ['', Validators.required],
			password: ['', Validators.required],
		});
	}

	onSubmit(): void {
		if (this.loginForm.valid) {
			const { email, password } = this.loginForm.value;
			console.log("Email:", email);
			console.log("STATUS:", this.isAccountInactive)
			if (this.isAccountInactive) {
				this.messageService.showSnackbar('Inactive account. Please reactivate it.', 'error');
				return;
			}

			this.authenticatorService.login(email, password).subscribe({
				next: (response: LoginResponse) => {
					if (response.userToken) {
						this.messageService.showSnackbar('Login successful!', 'success');
						this.authenticatorService.saveToken(response.userToken);
						this.router.navigateByUrl(this.authenticatorService.getTargetUrl());
					}
				},
				error: (err) => {
					console.log('Error:', err);
					if (err.error && typeof err.error === 'object' && err.error.error) {
						if (typeof err.error.error === 'string' && err.error.error.includes('Your account is inactive')) {
							this.isAccountInactive = true;
						}
					}
					this.messageService.showSnackbar("Error: " + err.error.error, "error", 3000);
					this.errorMessage = "Login has failed. Please try again.";
				},
			});
		} else {
			console.log("Invalid form");
		}
	}

	ativarConta(): void {
		console.log("Attempting to activate account...");
		const email = this.loginForm.get('email')?.value;
		console.log("Email:", email);

		if (!email) {
			this.messageService.showSnackbar('Please insert your email address before activating the account.', 'error');
			return;
		}

		this.authenticatorService.changeStatusByEmail2(email).subscribe({
			next: (response) => {
				console.log('Resposta ao tentar ativar a conta:', response);
				this.messageService.showSnackbar('Account successfully activated!', 'success');
				this.isAccountInactive = false;

				this.loginForm.reset();
				this.onSubmit();
			},
			error: (error) => {
				console.log('Error while trying to activate the account:', error);
				if (error.status === 404) {
					console.log('Endpoint não encontrado. Verifique a URL.');
				} else {
					console.log('Unexpected error:', error);
				}
				this.messageService.showSnackbar("Error while activating account. Please try again.", "error");
			}
		});
	}
}
