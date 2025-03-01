export interface Cars {
	brand: string;
	model: string;
	color: string;
	licensePlate: string;
	// _id: string;
}

export interface User {
	readonly userID: string;
	name: string;
	email: string;
	role: string;
	phoneNumber: string;
	NIF: string;
	birthDate?: string;
	status?: 'active' | 'inactive';
	driverRating: number;
	driverRatingCount: number;
	passengerRating: number;
	passengerRatingCount: number;
	driversLicense: string;
    cars?: Cars; 
	pendingDriverEvaluation?: string[];
	pendingPassengerEvaluation?: string[];
}
