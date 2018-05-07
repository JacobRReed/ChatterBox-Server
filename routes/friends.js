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
    let remove = req.body['remove'];
    let friend = req.body['friend'];
    console.log("User to fetch friends for: " + user);
    if (user && !remove && !friend) {
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
                        console.log("membersIDList: " + membersIDList);

                        //Retrieve usernames of all ids
                        let usernamesOfFriends = [];
                        db.manyOrNone('SELECT username FROM Members WHERE memberid = ANY($1)', [membersIDList])
                            .then(data => {
                                console.log("Recieved Data Query:" + JSON.stringify(data));
                                for (i = 0; i < data.length; i++) {
                                    usernamesOfFriends.push(data[i].username);
                                }
                                console.log("Result array: " + usernamesOfFriends);
                                res.send({
                                    friends: usernamesOfFriends
                                });
                            })
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
    } else if (user && remove && friend) {
        //REMOVE FRIEND
        console.log("Removing friend " + friend + " of " + user + ": (" + remove + ")");
        db.one('SELECT memberid FROM Members WHERE username LIKE $1', [user])
            .then(data => {
                console.log("User id:" + data.memberid);
                db.one('SELECT memberid FROM Members WHERE username LIKE $1', [friend])
                    .then(dataTwo => {
                        console.log("Friend id:" + dataTwo.memberid);
                        db.result('DELETE FROM Contacts WHERE (memberid_a=$1 OR memberid_b=$1) AND (memberid_a=$2 OR memberid_b=$2)', [data.memberid, dataTwo.memberid])
                            .then(result => {
                                //good to go
                                console.log("Friend " + friend + " removed from " + user + "'s contacts");
                                res.send({
                                    result: true
                                });
                            })
                    }).catch((err) => {
                        res.send({
                            result: false
                        })
                    })
            })
            .catch((err) => {
                res.send({
                    result: false
                })
            });
    }
});

module.exports = router;