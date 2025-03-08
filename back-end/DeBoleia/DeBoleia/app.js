var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var cors = require('cors');
var app = express();
var env = require('dotenv');

app.use(cors());

// env.config({ path: path.resolve(__dirname, '../../.env') });

//require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const API_PORT = process.env.DEBOLEIA_API_PORT || "8082";
const DB_CONN_STRING = process.env.DEBOLEIA_MONGO_DB_CON_STRING || "mongodb://127.0.0.1:27017/DeBoleia" ;

if (!DB_CONN_STRING) {
  console.error('Error: DEBOLEIA_MONGO_DB_CON_STRING not provided.');
  process.exit(1);
}

if (!API_PORT || isNaN(API_PORT)) {
  console.error('Error: DEBOLEIA_API_PORT not provided or invalid.');
  process.exit(1);
}


// ================================================================================

// MongoDB connection
mongoose.set('strictQuery', true);
try {
  mongoose.connect(DB_CONN_STRING);
  console.log(' ==> Connected to MongoDB');
}
catch (err) {
  console.log(' ==> Error connecting to MongoDB');
  console.log(err);
}

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const authenticationRoutes = require('./routes/authenticationRoutes');
app.use('/api/auth', authenticationRoutes);

const userProfileRoutes = require('./routes/userProfileRoutes');
app.use('/api/user', userProfileRoutes);

const tripsRoutes = require('./routes/tripsRouter');
app.use('/api/trips', tripsRoutes);

const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);

const carRoutes = require('./routes/carsRoutes');
app.use('/api/cars', carRoutes); 

app.listen(API_PORT);
console.log(" ==> DeBoleia running in port: " + API_PORT + "\n");

module.exports = { app };