//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const FormData = require("form-data");
const bodyParser = require("body-parser");
const http = require('http');

//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
var router = express.Router();

//AccuWeather API key
const weatherKey = process.env.WEATHER_KEY;


//Location vars
var latLon = "40.8,-77.8"; //Lat/lon
cityCode = ""; //City code
cityName = "";
var latLongCityCodeURL = ("http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + weatherKey + "&q=" + latLon);

//Current Conditions Vars
var ccWeatherText = ""; //Text for weather at location
var ccTemp = 0; //Degrees Farenheit
var ccIcon = 0; //weather icon number https://developer.accuweather.com/weather-icons
var ccURL = "test"; //URL for get
//12 hour forecast Conditions Vars


//5 day forecast conditions Vars

//Get city code
var savedResult = null;

//Get city code
http.get(latLongCityCodeURL, (resp) => {
    resp.on("data", (chunk) => {
        var result = JSON.parse(chunk);
        savedResult = result;
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});

// Display saved result once available.
setTimeout(displaySavedResult, 2000);

function displaySavedResult() {
    if (!savedResult) {
        console.log('Last result is null!');
    } else {
        console.log('Last result: City Code: ' + savedResult.Key + " Name" + savedResult.EnglishName);
        console.log('Last result (all properties): ', JSON.stringify(savedResult, null, 2));
    }
}

//Get current Conditions

//Get 12 hour forecast

//Get 5 day forecast

router.post('/', (req, res) => {
    res.send({
        success: true
    });
});


module.exports = router;