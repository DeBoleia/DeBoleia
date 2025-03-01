import { Routes } from '@angular/router';
import { UserComponent } from './component/user/user.component';
import { UserDetailsComponent } from './details/user-details/user-details.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './component/home/home.component';
import { TripCardComponent } from './component/trip-card/trip-card.component';
import { FindTripsComponent } from './component/find-trips/find-trips.component';
import { MapDisplayComponent } from './component/map-display/map-display.component';
import { RegisterComponent } from './component/register/register.component';
import { ApplicationComponent } from './component/application/application.component';
import { TripComponent } from './component/trip/trip.component';
import { CarDatabaseComponent } from './component/car-database/car-database.component';
import { CarBrandDetailsComponent } from './details/car-brand-details/car-brand-details.component';
import { RgpdComponent } from './component/rgpd/rgpd.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';
import { MyTripsComponent } from './component/my-trips/my-trips.component';
import { ChangePasswordComponent } from './component/change-password/change-password.component';
import { AuthGuard } from './Guards/auth.guard';
import { PendingEvaluationGuard } from './Guards/pending-evaluation.guard';


export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'home', component: HomeComponent },
	{ path: 'login', component: LoginComponent },
	{ path: "user", component: UserComponent},
	{ path: "user/:userID", component: UserDetailsComponent, canActivate: [PendingEvaluationGuard] },
	{ path: "login", component: LoginComponent },
	{ path: "register", component: RegisterComponent },
	{ path: "home", component: HomeComponent },
	{ path: "trips", component: FindTripsComponent , canActivate: [AuthGuard], data: { requiresAuth: true}},
	{ path: "offertrip", component: TripComponent , canActivate: [AuthGuard], data: { requiresAuth: true}},
	{ path: 'rgpd', component: RgpdComponent },
	{ path: 'aboutus', component: AboutusComponent },
	{ path: "mytrips", component: MyTripsComponent , canActivate: [AuthGuard], data: { requiresAuth: true}},
	{ path: 'cars', component: CarDatabaseComponent , canActivate: [AuthGuard], data: { requiresAuth: true}},
	{ path: 'cars/:brand', component: CarBrandDetailsComponent , canActivate: [AuthGuard], data: { requiresAuth: true}},	
	{ path: 'change-password', component: ChangePasswordComponent , canActivate: [AuthGuard], data: { requiresAuth: true}}

];