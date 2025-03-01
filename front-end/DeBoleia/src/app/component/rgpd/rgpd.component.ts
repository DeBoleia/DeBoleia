import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthenticatorService } from '../../services/authenticator.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-rgpd',
	templateUrl: './rgpd.component.html',
	standalone: true,
	imports: [CommonModule, RouterModule],
	styleUrls: ['./rgpd.component.scss'],
})
export class RgpdComponent {
	isLoggedIn: boolean = false;
	companyNameShort = 'DeBoleia';
	companyName = 'BeLeFrAnDa';
	email = 'dataprotection@deboleia.com';
	site = 'http://localhost:4200/';

	constructor(private authenticatorService: AuthenticatorService, private router: Router) {}

	ngOnInit(): void {
		this.isLoggedIn = this.authenticatorService.isLoggedIn();
	}

	voltarParaRegisto(): void {
		this.router.navigate(['/register']);
	}
}
