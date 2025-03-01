import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fullBackEndUrl } from '../../environments/environment';
import { Trip } from '../interfaces/trip';
import { Observable } from 'rxjs';
import { AuthenticatorService } from './authenticator.service';

@Injectable({
  providedIn: 'root'
})
export class TripsService {

  constructor(
    private http: HttpClient,
    private authService: AuthenticatorService
  ) { }

  private APIURL = fullBackEndUrl + '/api/trips'

  // ================================ POST ================================
  // router.post('/', verifyToken, tripsController.createTrip); // <==== UC06 

  createTrip(trip: any): Observable<Trip> {
    const localURL = this.APIURL;
    return this.http.post<Trip>(localURL, trip);
  }

  // // ================================ GET ================================

  // router.get('/', verifyToken, tripsController.getTrips); // <==== UC08

  getTrips(query: string): Observable<Trip[]> {
    const localURL = this.APIURL;
    return this.http.get<Trip[]>(localURL + '?' + query);
  }

  // router.get('/all', verifyToken, tripsController.getAllTrips);

  getAllTrips(): Observable<Trip[]> {
    const localURL = this.APIURL + '/all';
    return this.http.get<Trip[]>(localURL);
  }


  // router.get('/tripCode/:tripCode', verifyToken, tripsController.getTripByTripCode); 

  getTripByTripCode(tripCode: string): Observable<Trip> {
    const localURL = this.APIURL + '/tripCode/' + tripCode;
    return this.http.get<Trip>(localURL);
  }

  // router.get('/driver/:userID', verifyToken, tripsController.getTripsByDriver);

  getTripsByDriver(userID: string): Observable<Trip[]> {
    const localURL = this.APIURL + '/driver/' + userID;
    return this.http.get<Trip[]>(localURL);
  }

  // router.get('/passenger/:userID', verifyToken, tripsController.getTripsByPassenger);

  getTripsByPassenger(userID: string): Observable<Trip[]> {
    const localURL = this.APIURL + '/passenger/' + userID;
    return this.http.get<Trip[]>(localURL);
  }

  // router.get('/passengers/tripCode/:tripCode', verifyToken, tripsController.getPassengersByTripCode);

  getPassengersByTripCode(tripCode: string): Observable<string[]> {
    const localURL = this.APIURL + '/passengers/tripCode/' + tripCode;
    return this.http.get<string[]>(localURL);
  }

  // // ================================ PUT ================================
  // router.put('/tripCode/:tripCode/add/:userID', verifyToken, tripsController.addPassengerToTrip); // <==== UC14 -----> ONLY USED BY DRIVER

  addPassengerToTrip(tripCode: string, userID: string): Observable<Trip> {
    const localURL = this.APIURL + '/tripCode/' + tripCode + '/add/' + userID;
    return this.http.put<Trip>(localURL, {});
  }

  // router.put('/tripCode/:tripCode/remove/:userID', verifyToken, tripsController.removePassengerFromTrip); // <======= -----> ONLY USED BY PASSENGER

  removePassengerFromTrip(tripCode: string, userID: string): Observable<Trip> {
    const localURL = this.APIURL + '/tripCode/' + tripCode + '/remove/' + userID;
    return this.http.put<Trip>(localURL, {});
  }

  // // ================================ PATCH ================================
  // router.patch('/offer/tripCode/:tripCode', verifyToken, tripsController.offerTrip);

  offerTrip(tripCode: string): Observable<Trip> {
    const localURL = this.APIURL + '/offer/tripCode/' + tripCode;
    return this.http.patch<Trip>(localURL, {});
  }


  // router.patch('/start/tripCode/:tripCode', verifyToken, tripsController.startTrip);

  startTrip(tripCode: string): Observable<Trip> {
    const localURL = this.APIURL + '/start/tripCode/' + tripCode;
    return this.http.patch<Trip>(localURL, {});
  }

  // router.patch('/end/tripCode/:tripCode', verifyToken, tripsController.endTrip);

  endTrip(tripCode: string): Observable<Trip> {
    const localURL = this.APIURL + '/end/tripCode/' + tripCode;
    return this.http.patch<Trip>(localURL, {});
  }

  // router.patch('/finish/tripCode/:tripCode', verifyToken, tripsController.finishTrip);

  finishTrip(tripCode: string): Observable<Trip> {
    const localURL = this.APIURL + '/finish/tripCode/' + tripCode;
    return this.http.patch<Trip>(localURL, {});
  }

  // router.patch('/cancel/tripCode/:tripCode', verifyToken, tripsController.cancelTrip);

  cancelTrip(tripCode: string): Observable<Trip> {
    const localURL = this.APIURL + '/cancel/tripCode/' + tripCode;
    return this.http.patch<Trip>(localURL, {});
  }

}
