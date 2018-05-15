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


var router = express.Router();

router.post('/', (req, res) => {
  res.type("application/json");
  //Retrieve data from query params
  var first = req.body['first'];
  var last = req.body['last'];
  var username = req.body['username'];
  var email = req.body['email'];
  var password = req.body['password'];
  //Verify that the caller supplied all the parameters
  //In js, empty strings or null values evaluate to false
  if(first && last && username && email && password) {
    //We're storing salted hashes to make our application more secure
    //If you're interested as to what that is, and why we should use it
    //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
    let salt = crypto.randomBytes(32).toString("hex");
    let salted_hash = getHash(password, salt);

    //Use .none() since no result gets returned from an INSERT in SQL
    //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
    //If you want to read more: https://stackoverflow.com/a/8265319
    let params = [first, last, username, email, salted_hash, salt];
    db.none("INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6)", params)
    .then(() => {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);


        let emailAddr = email;
        let subjectLine = " You have registered with Chatterbox!";
        let bodyText = "You have registered for a great chat app, ChatterBox!";
        let htmlText = "<strong>You</strong> have registered for a great chat app, <strong>ChatterBox</strong>!\n please click on this link to validate your account: <a herf=\"chatterboxtcss450.herokuapp.com/register/validateusername?name=" + username + "\">link</a>";

         const msg = {
            to: emailAddr,
            from: 'chatterbox@uw.edu',
            subject: subjectLine,
            text: bodyText,
            html: htmlText,
          };

          sgMail.send(msg);
          res.send({
            result: "true"
          });

    }).catch((err) => {
      //log the error
      console.log(err);
      //If we get an error, it most likely means the account already exists
      //Therefore, let the requester know they tried to create an account that already exists
      res.send({
        success: false,
        error: err
      });
    });
  } else {
    res.send({
      success: false,
      input: req.body,
      error: "Missing required user information"
    });
  }
});

router.get("/validateusername", (req, res) => {
  let name = req.query['name'];
  console.log("the username is: " + name);
  db.none('UPDATE MEMBERS SET verification=\'1\' WHERE username=$1', [name])
  .then(() => {
    res.send({
      success: true
    });
     
  }).catch((err) => {
    //log the error
    console.log(err);
    res.send({
        success: false
    });
  });
});

module.exports = router;
