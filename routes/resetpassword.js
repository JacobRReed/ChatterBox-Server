//Default

//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendEmail = require('../utilities/utils').sendEmail;

var router = express.Router();

router.post('/', (req, res) => {
  res.type("application/json");
  //Retrieve data from query params
  var username = req.body['username'];
  var email = req.body['email'];
  var password = req.body['password'];
  //Verify that the caller supplied all the parameters
  //In js, empty strings or null values evaluate to false
  if(username && email && password) {
    //We're storing salted hashes to make our application more secure
    //If you're interested as to what that is, and why we should use it
    //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
    let salt = crypto.randomBytes(32).toString("hex");
    let salted_hash = getHash(password, salt);

    //Use .one() since one result gets returned from a SELECT in SQL
    //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
    //If you want to read more: https://stackoverflow.com/a/8265319
    let params = [username, email];
    let emailMatch = false;
    let usernameMatch = false;
    db.one('SELECT username, email FROM Members WHERE username=$1 AND email=$2', params)
    .then(() => {
        db.one('UPDATE MEMBERS SET Password=$2, Salt=$3 WHERE username=$1', params)
        // UPDATE MEMBERS SET password = 'gg', salt = 'ggez' WHERE username = 'thomas5862';
        .then(() => { 
            //We successfully added the new password, let the user know
            res.send({
                username: true,
                email: true
            });
            sendEmail("cfb3@uw.edu", email, "Password Reset.", "<strong>Your Password was just reset.</strong>");
        }).catch((err) => {
            //log the error
            console.log(err);
            res.send({
                username: false,
                email: emailMatch,
                error: 'error1: ' + username + ' and ' + email
            });
        });  
    }).catch((err) => {
        //log the error
        console.log(err);
        //If we get an error, it most likely means the account already exists
        //Therefore, let the requester know they tried to create an account that already exists
        res.send({
            username: true,
            email: emailMatch,
            error: 'error2: ' + username + ' and ' + email
        });
    });
  } else {
    res.send({
      username: usernameMatch,
      email: emailMatch,
      success: false,
      input: req.body,
      error: "Missing required user information"
    });
  }
});

module.exports = router;
