//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
var router = express.Router();

const weatherKey = process.env.WEATHER_KEY;
const AccuWeather = require('accuweather');
const forecast = new AccuWeather(weatherKey); //Unique client code used for identification and authorization purposes. Contact AccuWeather to receive an API key.

forecast
    .localkey(28580) // http://apidev.accuweather.com/developers/locationsAPIguide
    .time('hourly/1hour') // http://apidev.accuweather.com/developers/forecastsAPIguide
    .language("ru") // http://apidev.accuweather.com/developers/languages
    .metric(true) // Boolean value (true or false) that specifies to return the data in either metric (=true) or imperial units 
    .details(true) // Boolean value (true or false) that specifies whether or not to include a truncated version of the forecasts object or the full object (details = true)
    .get()
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    })