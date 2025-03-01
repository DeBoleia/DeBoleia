import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { fullBackEndUrl } from '../../environments/environment';
import { Application } from '../interfaces/application';
import { Observable } from 'rxjs';


// // ================================ POST ================================
// router.post('/', verifyToken, applicationController.createApplication);// <==== UC10

// // ================================ GET ================================
// router.get('/user/:userID', verifyToken, applicationController.getApplicationByUserID); // <==== UC19
// router.get('/user/:userID/status/:status', verifyToken, applicationController.getApplicationByUserByStatus);
// router.get('/tripCode/:tripCode/status/:status', verifyToken, applicationController.getApplicationByTripByStatus); // <==== UC12 ---> ONLY USED BY DRIVER
// router.get('/applicationCode/:applicationCode', verifyToken, applicationController.getApplicationByApplicationCode); 
// router.get('/trip/:tripCode', verifyToken, applicationController.getApplicationByTripCode);


// // ================================ PATCH ================================
// router.patch('/reject/applicationCode/:applicationCode', verifyToken, applicationController.rejectApplication); // <==== UC15 -----> ONLY USED BY DRIVER
// router.patch('/cancel/applicationCode/:applicationCode', verifyToken, applicationController.cancelApplication); // <==== ----> ONLY USED BY THE PASSENGER



@Injectable({
  providedIn: 'root'
})

export class ApplicationsService {
  private url: string = `${fullBackEndUrl}/api/applications`

  constructor(private http: HttpClient) { }

  createApplication(userID: string | null, tripCode: string | null) : Observable<Application> {
    return this.http.post<Application>(this.url, { userID: userID, trip: tripCode });
  }

  getApplicationByUserID(userID: string) {
    return this.http.get<Application[]>(`${this.url}/user/${userID}`);
  }

  getApplicationByUserByStatus(userID: string, status: string) {
    return this.http.get<Application[]>(`${this.url}/user/${userID}/status/${status}`);
  }

  getApplicationByTripByStatus(tripID: string, status: string) {
    return this.http.get<Application[]>(`${this.url}/tripCode/${tripID}/status/${status}`);
  }

  getApplicationByApplicationCode(applicationCode: string) {
    return this.http.get<Application>(`${this.url}/applicationCode/${applicationCode}`);
  }

  getApplicationByTripCode(tripID: string) {
    return this.http.get<Application[]>(`${this.url}/trip/${tripID}`);
  }

  rejectApplication(applicationCode: string) {
    return this.http.patch<Application>(`${this.url}/reject/applicationCode/${applicationCode}`, {});
  }

  cancelApplication(applicationCode: string) {
    return this.http.patch<Application>(`${this.url}/cancel/applicationCode/${applicationCode}`, {});
  }

}
