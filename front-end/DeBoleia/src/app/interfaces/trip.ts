export interface Trip {
	tripCode: string;
	car: any;
	status: 'created' | 'inOffer' | 'closed' | 'ongoing' | 'arrived' | 'finished' | 'canceled';
	nrSeats: number;
	estimatedCost?: number;
	pricePerPerson?: number;
	driver: string;
	passengers: string[];
	origin: {
		municipality?: string;
		parish?: string;
		district: string;
	};
	destination: {
		municipality?: string;
		parish?: string;
		district: string;
	};
	departureDate: Date;
	createdAt: Date;
}