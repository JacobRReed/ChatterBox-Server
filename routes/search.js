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

//Gets results based on options for search
router.post('/', (req, res) => {
    let option = req.body['option'];
    //Option 1 = email, option 2 = username, option 3 = first and last
    if (option === 1) {
        let email = req.body['email'];
        console.log("Searching for email: " + email);
        db.manyOrNone('SELECT username FROM MEMBERS WHERE LOWER(email) LIKE \'%$1#%\'', [email])
            .then(result => {
                console.log("Found: " + result);
                res.send({
                    matches: result
                });
            });
    } else if (option === 2) {
        let username = req.body['username'];
        console.log("Searching for username: " + username);
        db.manyOrNone('SELECT username FROM MEMBERS WHERE LOWER(username) LIKE \'%$1#%\'', [username])
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
        db.manyOrNone('SELECT username FROM MEMBERS WHERE LOWER(firstname) LIKE \'%$1#%\' AND LOWER(lastname) LIKE \'%$2#%\'', [firstName, lastName])
            .then(result => {
                console.log("Found: " + result);
                res.send({
                    matches: result
                });
            });
    }

});

//Handles sending request upon seach add
router.post('/ad', (req, res) => {
    let username = req.body['username'];
    let friendToAdd = req.body['friendToAdd'];
    console.log("Adding " + friendToAdd + " to " + username + "'s friends");
    //Get member id of username
    db.one('SELECT memberid FROM MEMBERS WHERE username=$1', [username])
        .then(result => {
            let userID = result.memberid;
            //Get friendToAdd id
            db.one('SELECT memberid FROM MEMBERS WHERE username=$1', [friendToAdd])
                .then(resultTwo => {
                    let friendToAddID = resultTwo.memberid;
                    db.result('INSERT INTO Contacts(memberid_a,memberid_b,sentby) VALUES ($1,$2,$1)', [username, friendToAdd])
                        .then(resultFinal => {
                            res.send({
                                success: true
                            });
                        });
                })
                .catch((err) => {
                    res.send({
                        success: false
                    });
                });
        });
});

module.exports = router;