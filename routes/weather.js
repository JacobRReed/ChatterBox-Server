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
const weatherKey = process.env.WEATHER_KEY_TWO;


cityCode = ""; //City code
cityName = "";

//Current Conditions Vars
var ccWeatherText = ""; //Text for weather at location
var ccTemp = 0; //Degrees Farenheit
var ccIcon = 0; //weather icon number https://developer.accuweather.com/weather-icons
var ccURL = "test"; //URL for get
var hourlyData = [];
var fiveDayData = [];

router.post('/', (req, res) => {
    let lat = req.body['lat'];
    let lon = req.body['lon'];
    var latLongCityCodeURL = ("http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + weatherKey + "&q=" + lat + "," + lon);
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
                        text: body[0].WeatherText,
                        temp: body[0].Temperature.Imperial.Value,
                        icon: body[0].WeatherIcon
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
            ccTemp = dataCC.temp;
            ccWeatherText = dataCC.text;
            ccIcon = dataCC.icon;
            //Get 12 hour forecast
            twelveGet(twelveURL).then(dataTwelve => {
                //Generate hourly data
                for (i = 0; i < dataTwelve.length; i++) {
                    hourlyData[i] = {
                        time: dataTwelve[i].EpochDateTime,
                        temp: dataTwelve[i].Temperature.Value,
                        text: dataTwelve[i].IconPhrase,
                        icon: dataTwelve[i].WeatherIcon
                    };
                }
            }).catch(err => console.log(err));
            fiveGet(fiveURL).then(dataFive => {
                //Generate five day data
                for (i = 0; i < dataFive.length; i++) {
                    fiveDayData[i] = {
                        time: dataFive[i].EpochDate,
                        min: dataFive[i].Temperature.Minimum.Value,
                        max: dataFive[i].Temperature.Maximum.Value,
                        iconDay: dataFive[i].Day.Icon,
                        iconNight: dataFive[i].Night.Icon,
                        dayPhrase: dataFive[i].Day.IconPhrase,
                        nightPhrase: dataFive[i].Night.IconPhrase
                    };
                }
                res.send({
                    success: true,
                    cityName: cityName,
                    cityCode: cityCode,
                    currentConditions: {
                        temp: ccTemp,
                        icon: ccIcon,
                        text: ccWeatherText
                    },
                    hourlyData: hourlyData[0],
                    fiveDayData: fiveDayData
                });
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log('Got error ', err));
});


module.exports = router;