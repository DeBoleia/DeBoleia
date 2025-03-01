
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class UserService {

	private apiUrl = 'http://localhost:8082/api' + '/user';

	constructor(private http: HttpClient) {}

	private getHeaders() {
		const token = localStorage.getItem('userToken');
		return new HttpHeaders({
			'Authorization': `Bearer ${token}`,
		});
	}

	// ======================== GET ======================== //

	// Get all users
	getAllUsers(): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// Get user by userID
	getUserByUserID(userID: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/id/${userID}`, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// Get user by email
	getUserByEmail(email: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/email/${email}`, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// Get user by token
	getUserByToken(): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/byToken`, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// Get user info for passenger (for driver)
	getPassengersInfo(): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/passenger`, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// ======================== PUT ======================== //

	// Update user by userID
	updateUserByUserID(userID: string, userData: any): Observable<any> {
		const token = localStorage.getItem('authToken');
		console.log('Token recuperado:', token);
		console.log('USER DATA USERSERVICE:', userData);
		return this.http.put<any>(`${this.apiUrl}/id/${userID}`, userData, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// Update user by email
	updateUserByEmail(email: string, userData: any): Observable<any> {
		return this.http.put<any>(`${this.apiUrl}/email/${email}`, userData, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// Change user status by userID
	changeStatusByEmail(email: string, statusData: any): Observable<any> {
		return this.http.put<any>(`${this.apiUrl}/status/${email}`, statusData, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// Change user password by userID
	changePasswordByUserID(userID: string, passwordData: any): Observable<any> {
		return this.http.put<any>(`${this.apiUrl}/pass/${userID}`, passwordData, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// ======================== PATCH ======================== //

	// Rate driver by userID
	rateDriver(userID: string, ratingData: any): Observable<any> {
		return this.http.patch<any>(`${this.apiUrl}/ratedriver/${userID}`, ratingData, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

  // Rate passengers
  ratePassengers(ratingData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/ratepassengers`, ratingData, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  rateOnePassenger(ratingData: any): Observable<any> {
    console.log('Rating Data:', ratingData);
    return this.http.patch<any>(`${this.apiUrl}/rateOnePassenger`, ratingData);
  }

	// ======================== DELETE ======================== //

	// Delete user by userID
	deleteUser(userID: string): Observable<any> {
		return this.http.delete<any>(`${this.apiUrl}/id/${userID}`, { headers: this.getHeaders() }).pipe(
			catchError(this.handleError)
		);
	}

	// ======================== Error Handler ======================== //

	private handleError(error: any): Observable<never> {
		let errorMessage = 'An error occurred while processing the request.';
		if (error.error instanceof ErrorEvent) {
			errorMessage = `Error: ${error.error.message}`;
		} else {
			errorMessage = `Error: ${error.status} - ${error.message}`;
		}
		return throwError(errorMessage);
	}

	changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
		const userID = localStorage.getItem('userID');
		return this.http.put(`${this.apiUrl}/pass/${userID}`, {
			oldPassword,
			newPassword,
			confirmPassword,
		});
	}

}