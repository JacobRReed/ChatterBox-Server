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
    //Get user id
    db.one('SELECT memberid FROM Members WHERE username LIKE $1', [user])
        .then(data => {
            let memberID = data['memberid'];
            //Find all NON verified friends
            db.manyOrNone('SELECT memberid_b FROM Contacts WHERE memberid_a=$1 AND verified=0 UNION SELECT memberid_a FROM Contacts WHERE memberid_b=$1 AND verified=0', [memberID])
                .then(dataTwo => {
                    //Pull out all member IDS
                    membersIDList = [];
                    for (i = 0; i < dataTwo.length; i++) {
                        membersIDList.push(dataTwo[i].memberid_b);
                    }
                    //Retrieve usernames of all ids
                    let usernamesOfFriends = [];
                    db.manyOrNone('SELECT username FROM Members WHERE memberid = ANY($1)', [membersIDList])
                        .then(dataThree => {
                            for (i = 0; i < dataThree.length; i++) {
                                usernamesOfFriends.push(dataThree[i].username); //All usernames of people not verified as friend yet
                            }
                            res.send({
                                possibleFriends: usernamesOfFriends
                            });
                        })
                })
        })

});

module.exports = router;