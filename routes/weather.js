//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
var router = express.Router();

const AccuWeather = require('accuweather');
const weather = new AccuWeather(process.env.WEATHER_KEY);

router.post('/', (req, res) => {
    weather.localkey(28580).details(true).get().then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });
});