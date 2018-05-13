//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

var router = express.Router();

router.post('/', (req, res) => {
    let option = req.body['option'];
    //Option 1 = email, option 2 = username, option 3 = first and last
    if (option === 1) {
        let email = req.body['email'];
        console.log("Searching for email: " + email);
        db.manyOrNone('SELECT memberid,firstname,lastname,username,email FROM MEMBERS WHERE email LIKE $1', [email])
            .then(result => {
                console.log("Found: " + result);
                res.send({
                    matches: result
                });
            });
    } else if (option === 2) {
        let username = req.body['username'];
        console.log("Searching for username: " + username);
        db.manyOrNone('SELECT memberid,firstname,lastname, username,email FROM MEMBERS WHERE username LIKE $1', [username])
            .then(result => {
                console.log("Found: " + result);
                res.send({
                    matches: result
                });
            });
    } else if (option === 3) {
        let firstName = req.body['firstName'];
        let lastName = req.body['lastName'];
        console.log("Searching for first name: " + firstName + ", last name: " + lastName);
        db.manyOrNone('SELECT memberid,firstname,lastname, username,email FROM MEMBERS WHERE firstname LIKE $1 AND lastname LIKE $2', [firstName, lastName])
            .then(result => {
                console.log("Found: " + result);
                res.send({
                    matches: result
                });
            });
    }

});

module.exports = router;