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
const weatherKey = process.env.WEATHER_KEY_FINAL;

const latitudePos = "47.25";
const longitudePos = "-122.44";

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

router.post('/', (req, res) => {
    let zip = req.body['searchByZip']; //If true search by zip, else search by lat lon
    
    if(zip) {
        let zipCode = req.body['zip'];
        let ccURL = ("http://api.openweathermap.org/data/2.5/weather?zip=" + zipCode + "&APPID=" + weatherKey);
        let fiveDayURL = ("http://api.openweathermap.org/data/2.5/forecast?zip=" + zipCode + "&APPID=" + weatherKey);
    } else {
        let lat = req.body['lat'];
        let lon = req.body['lon'];
        let ccURL = ("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=" + weatherKey);
        let fiveDayURL = ("http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&APPID=" + weatherKey);
    }

    //Get calls
    ccGet(ccURL).then(dataCC => {
        //Get cc stuff
        let currentWeather = dataCC.body.weather[0].main;
        let currentIcon = dataCC.body.weather[0].icon;
        let currentTemp = Math.round((dataCC.body.main.temp * (9 / 5) - 459.67));
        let currentSunrise = new Date(dataCC.body.sys.sunrise * 1000);
        currentSunrise = currentSunrise.getHours() + ":" + currentSunrise.getMinutes();
        let currentSunset = new Date(dataCC.body.sys.sunset * 1000);
        currentSunset = currentSunset.getHours() + ":" + currentSunset.getMinutes();
        let currentCity = dataCC.body.name;
        //Test output logs
        console.log("Current Conditions\n-----------------");
        console.log("City: " + currentCity);
        console.log("Current Weather: " + currentWeather);
        console.log("Icon: " + currentIcon);
        console.log("Temperature: " + currentTemp);
        console.log("Sunrise Time: " + currentSunrise);
        console.log("Sunset Time: " + currentSunset);
        //Define result variables
        let currentConditionVars = {
            weather: currentWeather,
            icon: currentIcon,
            temp: currentTemp,
            city: currentCity
        };
        let sunVars = {
            sunrise: currentSunrise,
            sunset: currentSunset
        };
        /*
                res.send({
                    currentConditions: currentConditionVars,
                    sun: sunVars
                });*/

        fiveGet(fiveDayURL).then(dataFive => {
            //get 5 day stuff
            let currentDay = new Date().getDate(); //Current day number, get the next 3 days
            currentDay = parseInt(currentDay);
            let fiveDayForecast = [];
            let visited = [];
            for (i = 0; i < dataFive.body.list.length; i++) {
                let tempDate = new Date(dataFive.body.list[i].dt * 1000);
                tempDate = tempDate.getDate(); //current day number of month
                tempDate = parseInt(tempDate);
                if (tempDate !== currentDay && !visited.includes(tempDate)) { //If day in list is not today, and it hasnt been visited already
                    let tempDay = new Date(dataFive.body.list[i].dt * 1000); //day
                    tempDay = tempDay.toString().split(' ')[0]; //Get name of day
                    visited.push(tempDate);
                    fiveDayForecast.push({
                        day: tempDay,
                        temp: (Math.round((dataFive.body.list[i].main.temp * (9 / 5) - 459.67))),
                        icon: dataFive.body.list[i].weather[0].icon,
                        text: dataFive.body.list[i].weather[0].description
                    });
                }
            }
            console.log("5 Day Data: " + JSON.stringify(fiveDayForecast));
            res.send({
                currentConditions: currentConditionVars,
                sun: sunVars,
                fiveDay: fiveDayForecast
            });
            res.end();
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});





module.exports = router;