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
    console.log("User to fetch friends for: " + user);
    if (user) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT memberid FROM Members WHERE username LIKE $1', [user])
            //If successful, run function passed into .then()
            .then(row => {
                let memberID = row['memberid'];
                db.manyOrNone('SELECT memberid_b FROM Contacts WHERE memberid_a=$1 UNION SELECT memberid_a FROM Contacts WHERE memberid_b=$1', [memberID])
                    .then(row => {
                        //Pull out all member IDS
                        membersIDList = [];
                        for (i = 0; i < row.length; i++) {
                            membersIDList.push(row[i].memberid_b);
                        }

                        //Retrieve usernames of all ids
                        let usernamesOfFriends = [];
                        for (var x in membersIDList) {
                            console.log(membersIDList.x);
                            db.manyOrNone('SELECT username FROM Members WHERE memberid=$1', [membersIDList.x])
                                .then(name => {
                                    usernamesOfFriends.push(name);
                                });
                        }
                        console.log(usernamesOfFriends);
                        res.send({
                            friends: usernamesOfFriends
                        });
                    });
            })
            //More than one row shouldn't be found, since table has constraint on it
            .catch((err) => {
                //If anything happened, it wasn't successful
                res.send({
                    success: false,
                    message: err
                });
            });
    }
});

module.exports = router;