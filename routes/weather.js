//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const FormData = require("form-data");
const bodyParser = require("body-parser");
const http = require('http');
const async = require('async');

//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
var router = express.Router();

//AccuWeather API key
const weatherKey = process.env.WEATHER_KEY_FOUR;


cityCode = ""; //City code
cityName = "";

//Current Conditions Vars
var ccWeatherText = ""; //Text for weather at location
var ccTemp = 0; //Degrees Farenheit
var ccIcon = 0; //weather icon number https://developer.accuweather.com/weather-icons
var ccURL = "test"; //URL for get
var hourlyData = [];
var fiveDayData = [];

////TEMP
var latLon = "40.8,-77.8";

var latLongCityCodeURL = ("http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + weatherKey + "&q=" + latLon);

//Get city code
const httpGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    body = JSON.parse(body);
                } catch (err) {
                    reject(new Error(err));
                }
                resolve({
                    code: body.Key,
                    name: body.EnglishName
                });
            });
        }).on('error', reject);
    });
};

//Current Conditions
const ccGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    body = JSON.parse(body);
                } catch (err) {
                    reject(new Error(err));
                }
                resolve({
                    body: body
                });
            });
        }).on('error', reject);
    });
};

//12 hour
const twelveGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    body = JSON.parse(body);
                } catch (err) {
                    reject(new Error(err));
                }
                resolve({
                    body: body
                });
            });
        }).on('error', reject);
    });
};

//5 day
const fiveGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    body = JSON.parse(body);
                } catch (err) {
                    reject(new Error(err));
                }
                resolve({
                    body: body
                });
            });
        }).on('error', reject);
    });
};

//Get city code from lat lon
httpGet(latLongCityCodeURL).then(data => {
    cityCode = data.code;
    cityName = data.name;
    ccURL = ("http://dataservice.accuweather.com/currentconditions/v1/" + cityCode + "?apikey=" + weatherKey);
    twelveURL = ("http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + cityCode + "?apikey=" + weatherKey);
    fiveURL = ("http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + cityCode + "?apikey=" + weatherKey);
    //Get Current Conditions
    ccGet(ccURL).then(dataCC => {
        let ccBody = dataCC.body[0];
        ccTemp = ccBody.Temperature.Imperial.Value;
        ccWeatherText = ccBody.WeatherText;
        ccIcon = ccBody.WeatherIcon;
        //Get 12 hour forecast
        twelveGet(twelveURL).then(dataTwelve => {
            let twelveBody = dataTwelve.body;
            //Generate hourly data
            for (i = 0; i < twelveBody.length; i++) {
                hourlyData[i] = {
                    time: twelveBody[i].EpochDateTime,
                    temp: twelveBody[i].Temperature.Value,
                    text: twelveBody[i].IconPhrase,
                    icon: twelveBody[i].WeatherIcon
                };
            }
            fiveGet(fiveURL).then(dataFive => {
                //console.log(dataFive.body.DailyForecasts);
                let fiveBody = dataFive.body.DailyForecasts;
                //Generate five day data
                for (j = 0; j < fiveBody.length; j++) {
                    fiveDayData[j] = {
                        time: fiveBody[j].EpochDate,
                        min: fiveBody[j].Temperature.Minimum.Value,
                        max: fiveBody[j].Temperature.Maximum.Value,
                        iconDay: fiveBody[j].Day.Icon,
                        iconNight: fiveBody[j].Night.Icon,
                        dayPhrase: fiveBody[j].Day.IconPhrase,
                        nightPhrase: fiveBody[j].Night.IconPhrase
                    };
                }
                //TEST LOGS
                console.log("City Name: " + cityName + ", Code: " + cityCode);
                console.log("Current Conditions: " + ccWeatherText + ", " + ccTemp + " F");
                console.log("12 hour: " + JSON.stringify(hourlyData));
                console.log("5 day: " + JSON.stringify(fiveDayData));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}).catch(err => console.log('Got error ', err));


router.post('/', (req, res) => {
    res.send({
        success: "true"
    });
});


module.exports = router;