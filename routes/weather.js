//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const https = require('https');
const FormData = require("form-data");
const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
var router = express.Router();

//AccuWeather API key
const weatherKey = process.env.WEATHER_KEY;

//Temp for now
var latLon = "40.8,-77.8";

//Url to get city code based on lat and lon
var latLongCityCodeURL = ("https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + weatherKey + "&q=" + latLon);
https.get(latLongCityCodeURL, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });
    resp.on('end', () => {
        console.log(JSON.parse(data).explanation);
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});

var cityCode = 0;
var currentConditionsURL = ("https://dataservice.accuweather.com/currentconditions/v1/" + cityCode + "?apikey=" + weatherKey);


router.post('/', (req, res) => {
    res.send({
        success: true
    });
});


module.exports = router;