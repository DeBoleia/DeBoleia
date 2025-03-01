export const environment = {
	production: false,
	BackEndUrl: 'http://localhost:',
	BackEndPort: '8082', // Add the port here
	// GeoApiUrl: 'https://api.opencagedata.com/geocode/v1/json',
};

// Combine the URL and port
export const fullBackEndUrl = `${environment.BackEndUrl}${environment.BackEndPort}`;
