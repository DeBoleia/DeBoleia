### CARPOOL BACKEND

# CARPOOL_BE
A RESTful API for a ride-sharing application. This API is part of a project that also includes the Carros_BE and APP_FE repositories, as well as an APP-INFRA repository for containerization and a docs repository for additional documentation.

# Models
- **Application Model**: Used to apply for a ride. Includes a generated code, a trip, userID, application date, and status (underReview, approved, rejected, canceled, waitlist, or expired).
- **Car Model**: includes brand and model (retrieved from Carros_BE), as well as car color and license plate.
- **Geolocation Model**: Based off geoAPI categories. Includes municipality, parish, and district.
- **Trips Model**: The trips themselves. They include a trip code, a car, a driver, number of seats, estimated cost, price per person, passengers, origin, destination, departure date, date of creation, and status (created, in offer, closed, ongoing, arrived, finished, and canceled).

# Prerequisites
[NodeJS](https://nodejs.org/en/download/prebuilt-installer/current)

[DB Browser for SQLite]( https://sqlitebrowser.org/dl/)

[GeoAPI] https://geoapi.pt/docs/

## Installation
Use the command line inside the project's folder:

```bash
npm install
```

## Usage
Run the project in VSCode, with or without debugging, or run in the command line inside the project's folder:

```bash
node app.js
```

## Additional requisites
A local SQLite database with different types of users is necessary to test authentication and authorisations. Though basic, a functional database is provided in the form of a deboleia_users.db file.
All necessary middleware is provided, as well as a decryption key.  
MongoDB credentials for DB access and manipulation are stored in a .env available upon request. It also contains the API_PORT that will be used to run the API, which could also be directly defined by the user in the app.js.
A connection to the Carros_BE backend is necessary and set up through Axios.

## Code comprehension
As the API is very simple, inline comments should be enough to understand its workings.

## Test
To test the API, you can use
[Postman](https://www.postman.com/downloads/).

You can import the included Carros_BE_Tests.postman_collection.json file into Postman to test the POST, GET, and PUT routes.

Note: the Postman folder includes variables for storing tokens and the base_url, which may need to be changed according to your ports and SQLite database.

## Routes

In the scope of the project, non-authenticated users will need to log in to access any routes. 

Summary of available routes:

**Applications**
- POST: Request a ride (create application);
- GET: Find applications (by userID, status, etc.);
- PATCH: Cancel application (for the passenger); reject application (for the driver).

**Authentication**
- POST: Register user;
- POST: Log in;
- PUT: Change user status (active, inactive).

**Cars**
- POST: Create a user's car;
- POST: Define a user's car model;
- GET: Fetch car brands;
- PUT: Update a user's car;
- DELETE: delete a user's car(s).

**Trips**
- POST: Create a trip;
- GET: fetch trips (all trips, by trip code, by driver/passenger, all passengers on a trip);
- PUT: Add passenger to trip (used by drivers);
- PUT: Remove passenger from trip (used by passengers);
- PATCH: Change trip status (offer, start, end, finish, cancel).

**Users**
- GET: fetch users (all users, by ID, email, etc.);
- PUT: update user, change user status, change password;
- PATCH: Rate drivers/passengers;
- DELETE: Delete users.

Please see the inline documentation for more info regarding validations and verifications (e.g. creating duplicates).