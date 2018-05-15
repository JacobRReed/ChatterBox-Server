//Default


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

//app.get('/users') means accept http 'GET' requests at path '/users'
router.post('/', (req, res) => {
    
    let user = req.body['username'];
    let theirPw = req.body['password'];
    let params = [user, '1'];
    let wasSuccessful = false;
    let passwordMatch = false;
    let usernameMatch = false;
    let verification = false;
    if (user && theirPw) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT Password, Salt FROM Members WHERE username=$1', [user])
            //If successful, run function passed into .then()
            .then(row => {
                let usernameMatch = true;
                let salt = row['salt'];
                let ourSaltedHash = row['password']; //Retrieve our copy of the password
                let theirSaltedHash = getHash(theirPw, salt); //Combined their password with our salt, then hash
                let passwordMatch = ourSaltedHash === theirSaltedHash; //Did our salted hash match their salted hash?
                
                // select statement to check for verificaton
                db.one('SELECT username FROM Members WHERE username=$1 AND verification=$2', params)
                    .then(row => {
                        verification = true;
                        res.send({
                            username: usernameMatch,
                            password: passwordMatch,
                            verification: verification
                        });


                    }).catch((err) => {
                        //If anything happened, it wasn't successful
                        res.send({
                            username: usernameMatch,
                            password: passwordMatch,
                            verification: verification,
                            message: err,
                            error: 'error1: ' + username + ' and ' + email + ' and ' + verification
                        });
                    });
                //Send whether they had the correct password or not
                res.send({
                    username: usernameMatch,
                    password: passwordMatch,
                    verification: verification
                    
                });
            })
            //More than one row shouldn't be found, since table has constraint on it
            .catch((err) => {
                //If anything happened, it wasn't successful
                res.send({
                    username: usernameMatch,
                    password: passwordMatch,
                    verification: verification,
                    message: err
                });
            });
    } else {
        res.send({
            username: false,
            password: false,
            verification: false,
            message: 'missing credentials'
        });
    }
});

module.exports = router;