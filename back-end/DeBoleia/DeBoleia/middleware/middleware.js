const jwt = require('jsonwebtoken');
const fs = require('fs');
const secretKey = fs.readFileSync('./private/private.key')
const tripMiddleware = require('./tripMiddleware');
const applicationMiddleware = require('./applicationMiddleware');

// for GET requests
async function AuthGET(req, res, next, err, decodedUser) {
	if (!decodedUser) {
		return res.status(403).json({ error: 'Access denied: No token provided' });
	}
	req.user = decodedUser; 
	if (req.baseUrl === '/api/user') {
		if (req.params.userID && req.params.userID === decodedUser.userID) { return next(); }
		if (req.params.email && req.params.email === decodedUser.email) { return next(); }
		if (req.path === '/byToken') { return next(); }
		if (req.path === '/passenger') { return next(); }
		if (req.path === '/' && decodedUser.role === 'admin') { return next(); }
	}
	
	
	return res.status(403).json({ error: 'Access denied to the route: AuthGET' });
}

// for POST requests
async function AuthPOST(req, res, next, err, decodedUser) {
	return res.status(403).json({ error: 'Access denied to the route: AuthPOST' });
}

// for PUT requests
async function AuthPUT(req, res, next, err, decodedUser) {
	if (req.baseUrl === '/api/user') {
		if (req.originalUrl === `/api/user/id/${req.params.userID}` && req.params.userID === decodedUser.userID) {
			return next();
		} 
		if (req.originalUrl === `/api/user/email/${req.params.email}` && req.params.email === decodedUser.email) {
			return next();
		} 
		if (req.originalUrl === `/api/user/pass/${req.params.userID}` && req.params.userID === decodedUser.userID){
			return next();
		}
		if (req.originalUrl === `/api/user/pass/${req.params.userID}` && decodedUser.userID === req.params.userID ) {
			return next();
		}
		if (req.originalUrl === `/api/user/status/${req.params.email}` 
			&& decodedUser.email === req.params.email && 
			decodedUser.role === 'user') {
			return next();
		}
	}
	
	return res.status(403).json({ error: 'Access denied to the route: AuthPUT' });
}

// for DELETE requests
async function AuthDELETE(req, res, next, err, decodedUser) {

    console.log('req.originalUrl:', req.originalUrl);  
    console.log('req.params:', req.params); 
    console.log('decodedUser:', decodedUser);      
    console.log('req.params.userID:', req.params.userID);   
    console.log('decodedUser.role:', decodedUser.role);     


    if (req.originalUrl === `/api/user/id/${req.params.userID}` && decodedUser.role === 'admin') {
        return next();  
    }

 
    return res.status(403).json({ error: 'Access denied to the route: AuthDELETE' });
}


const verifyToken = async (req, res, next) => {
// const verifyToken = (req, res, next) => {
	const token = req.headers['authorization']?.split(" ")[1];
	if (!token) {
		console.log('No token provided');
		return res.status(403).json({ error: 'No token provided' });
	}

	jwt.verify(token, secretKey , async (err, decodedUser) => {
		if (err) {
			console.log('Token verification failed:', err.message);
			if (err.name === 'TokenExpiredError') {
				return res.status(401).json({ error: 'Token expired' });  
			}
			return res.status(401).json({ error: 'Unauthorized', details: err.message });
		}
		if (!decodedUser?.userID || !decodedUser?.email || !decodedUser?.status || !decodedUser?.role) {
			return res.status(401).json({ error: 'Invalid token payload' });
		}
		if (req.baseUrl === '/api/trips') {
			return await tripMiddleware(req, res, next, err, decodedUser);
		} else if (req.baseUrl === '/api/applications') {
			return await applicationMiddleware(req, res, next, err, decodedUser);
		} else {
			if (req.method === 'POST') {
				return await AuthPOST(req, res, next, err, decodedUser);
			}
			if (req.method === 'GET') {
				return await AuthGET(req, res, next, err, decodedUser);
			}
			if (req.method === 'PUT') {
				return await AuthPUT(req, res, next, err, decodedUser);
			}
			if (req.method === 'DELETE') {
				return await AuthDELETE(req, res, next, err, decodedUser);
			}
		}
	});
};

module.exports = verifyToken;
