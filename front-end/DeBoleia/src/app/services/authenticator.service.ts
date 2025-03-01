import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs/operators';
//import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AuthenticatorService {
	private tokenKey = 'userToken';
	private tokenUserID = 'userID';
	private tokenRole = 'role';
	private tokenStatus = 'userStatus';
	//private apiUrl = environment.SAFE_BE_URL +  '/auth';
	private apiUrl = 'http://localhost:8082/api' + '/auth';

	constructor(private http: HttpClient, private router: Router) {}

	private targetUrl: string = '/';

	saveTargetUrl(url: string) {
		this.targetUrl = url;
	}

	getTargetUrl(): string {
		return this.targetUrl;
	}
	clearTargetUrl(): void {
		this.targetUrl = '/';
	}

	login(email: string, password: string): Observable<{ userToken: string }> {
		const body = { email, password };

		return this.http
			.post<{ userToken: string }>(`${this.apiUrl}/login`, body)
			.pipe(
				tap((response) => {
					console.log('Received token:', response.userToken);
					this.saveToken(response.userToken);
				})
			);
	}

  saveToken(token: string): void {
    const decodedToken: any = jwtDecode(token);
    localStorage.setItem(this.tokenKey, token);
    const role = decodedToken.role || decodedToken.userRole;
    // console.log('Extracted role:', role);
    localStorage.setItem(this.tokenRole, role);
    localStorage.setItem(this.tokenUserID, decodedToken.userID);
    // console.log('userID SAVE AAA decoded==> :', decodedToken.userID);
    
    localStorage.setItem(this.tokenStatus, decodedToken.status);
    // console.log('status SAVE AAA decoded==> :', decodedToken.status);
  }

	getToken(): string | null {
		return localStorage.getItem(this.tokenKey);
	}

	getUserRole(): string | null {
		const role = localStorage.getItem(this.tokenRole);

		return role;
	}

	getUserId(): string | null {
		// console.log('userID @@@ decoded==> :', localStorage.getItem(this.tokenUserID));
		return localStorage.getItem(this.tokenUserID);
	}

	isLoggedIn(): boolean {
		return !!this.getToken();
	}

	logout(): void {
		localStorage.removeItem(this.tokenKey);
		localStorage.removeItem('email');
		sessionStorage.removeItem('userEmail');
		localStorage.removeItem('role');
		this.router.navigate(['/home']);
	}

	register(
		name: string,
		email: string,
		phoneNumber: string,
		password: string
	): Observable<any> {
		const body = { name, email, phoneNumber, password };
		return this.http.post(`${this.apiUrl}/register`, body);
	}

	changeStatusByEmail(email: string): Observable<any> {
		const token = this.getToken();
		const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
		return this.http.put(`${this.apiUrl}/status/${email}`, {}, { headers });
	}

	changeStatusByEmail2(email: string): Observable<any> {
		return this.http.put(`${this.apiUrl}/status2/${email}`, {});
	}

	getUserEmail(): string | null {
		const token = this.getToken();
		if (!token) return null;
		const decodedToken: any = jwtDecode(token);
		return decodedToken.email || null;
	}

	getUserID(): string | null {
		const token = this.getToken();
		if (!token) return null;
		const decodedToken: any = jwtDecode(token);
		return decodedToken.userID || null;
	}

  getUserStatus(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken: any = jwtDecode(token);
    // console.log('status @@@ decoded==> :', decodedToken.userStatus);

		return decodedToken.userStatus || null;
	}
}
