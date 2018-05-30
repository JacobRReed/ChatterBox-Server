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

// router.post('/', (req, res) => {
//   res.type("application/json");
//   //Retrieve data from query params
//   var username = req.body['username'];
//   var email = req.body['email'];
//   var password = req.body['password'];
//   //Verify that the caller supplied all the parameters
//   //In js, empty strings or null values evaluate to false
//   if(username && email && password) {
//     //We're storing salted hashes to make our application more secure
//     //If you're interested as to what that is, and why we should use it
//     //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
//     let salt = crypto.randomBytes(32).toString("hex");
//     let salted_hash = getHash(password, salt);
//
//     //Use .one() since one result gets returned from a SELECT in SQL
//     //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
//     //If you want to read more: https://stackoverflow.com/a/8265319
//     let params = [username, email];
//     let passwordparams = [username, salted_hash, salt];
//     let emailMatch = false;
//     let usernameMatch = false;
//     db.one('SELECT username, email FROM Members WHERE username=$1 AND email=$2', params)
//     .then(() => {
//         db.none('UPDATE MEMBERS SET Password=$2, Salt=$3 WHERE username=$1', passwordparams)
//         // UPDATE MEMBERS SET password = 'gg', salt = 'ggez' WHERE username = 'thomas5862';
//         .then(() => {
//             //We successfully added the new password, let the user know
//
//             const sgMail = require('@sendgrid/mail');
//             sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//
//
//             let emailAddr = email;
//             let subjectLine = " Chatterbox Password Changed!";
//             let bodyText = "You have recently changed your password on Chatterbox.";
//             let htmlText = "<strong>You</strong> have recently changed your password on <strong>ChatterBox</strong>.";
//
//             const msg = {
//                 to: emailAddr,
//                 from: 'chatterbox@uw.edu',
//                 subject: subjectLine,
//                 text: bodyText,
//                 html: htmlText,
//             };
//             sgMail.send(msg);
//             res.send({
//                 username: true,
//                 email: true
//             });
//         }).catch((err) => {
//             //log the error
//             console.log(err);
//             res.send({
//                 username: false,
//                 email: false,
//                 error: 'error1: ' + username + ' and ' + email
//             });
//         });
//     }).catch((err) => {
//         //log the error
//         console.log(err);
//         //If we get an error, it most likely means the account already exists
//         //Therefore, let the requester know they tried to create an account that already exists
//
//         res.send({
//             username: false,
//             email: false,
//             error: 'error2: ' + username + ' and ' + email
//         });
//     });
//   } else {
//     res.send({
//       username: false,
//       email: false,
//       success: false,
//       input: req.body,
//       error: "Missing required user information"
//     });
//   }
// });

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

    salt = String(salt).split("").reverse().join("");
    // salted_hash = String(salted_hash);


    //Use .one() since one result gets returned from a SELECT in SQL
    //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
    //If you want to read more: https://stackoverflow.com/a/8265319
    let params = [username, email];
    // let passwordparams = [username, salted_hash, salt];
    let emailMatch = false;
    let usernameMatch = false;
    db.one('SELECT username, email FROM Members WHERE username=$1 AND email=$2', params)
    .then(() => {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);


        let emailAddr = email;
        let subjectLine = "Changed password on ChatterBox";
        let bodyText = "You have changed your password please validate";
        let htmlText = "<strong>ChatterBox</strong>!\n please click on this link to validate your new password: https://chatterboxtcss450.herokuapp.com/resetpassword/validatepassword?username=" + username + "&salt=" + salt + "&hash=" + salted_hash;
        console.log("username=" + username + "&salt=" + salt + "&hash=" + salted_hash);
         const msg = {
            to: emailAddr,
            from: 'chatterbox@uw.edu',
            subject: subjectLine,
            text: bodyText,
            html: htmlText,
          };

          sgMail.send(msg);
          res.send({
            username: true,
            email: true
          });
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      //
      //
      //   let emailAddr = email;
        // let subjectLine = "Changed password on ChatterBox";
        // let bodyText = "You have changed your password please validate";
        // let htmlText = "<strong>ChatterBox</strong>!\n please click on this link to validate your new password: chatterboxtcss450.herokuapp.com/resetpassword/validatepassword?username=" + username + "&salt=" + salt + "&hash=" + salted_hash;
      //
      //    const msg = {
      //       to: emailAddr,
      //
      //       from: 'chatterbox@uw.edu',
      //       subject: subjectLine,
      //       text: bodyText,
      //       html: htmlText,
      //     };
      //
      //     sgMail.send(msg);
      //     res.send({
      //       result: "true"
      //     });
    }).catch((err) => {
        console.log(err);
        res.send({
            username: false,
            email: false,
            error: 'error2: ' + username + ' and ' + email
        });
    });
  } else {
    res.send({
      username: false,
      email: false,
      success: false,
      input: req.body,
      error: "Missing required user information"
    });
  }
});

router.get("/validatepassword", (req, res) => {
  let username = req.query['username']
  let salt = req.query['salt'];
  let hash = req.query['hash'];

  salt = salt.split("").reverse().join("");

  db.none('UPDATE MEMBERS SET Password=$3, Salt=$2 WHERE username=$1', [username, salt, hash])
  .then(() => {
      res.send({
          success: true
      });
  }).catch((err) => {
      //log the error
      console.log(err);
      res.send({
          error: 'error: did not work'
      });
  });


  // db.none('UPDATE MEMBERS SET verification=\'1\' WHERE username=$1', [name])
  // .then(() => {
  //   res.send({
  //     success: true
  //   });
  //
  // }).catch((err) => {
  //   //log the error
  //   console.log(err);
  //   res.send({
  //       success: false
  //   });
  // });
});





// router.post('/changePassword', (req, res) => {
//     let emailAddr = req.body['emailAddress'];
//     let
//     let subjectLine = "Chatterbox: Please confirm changing your password";
//     let bodyText = "You have changed your password while in the device please click on the link to approve changes.";
//     let htmlText = "You have successfully changed your password!";
//
//     const msg = {
//         to: emailAddr,
//         from: 'chatterbox@uw.edu',
//         subject: subjectLine,
//         text: bodyText,
//         html: htmlText,
//     };
//
//     sgMail.send(msg);
//     res.send({
//         result: "true"
//     });
// });

module.exports = router;
