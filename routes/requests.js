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

//Get all requests not from user -INCOMING REQUESTS
router.post('/inc', (req, res) => {
    let user = req.body['username'];
    //Get user id
    db.one('SELECT memberid FROM Members WHERE username LIKE $1', [user])
        .then(data => {
            let memberID = data['memberid'];
            //Find all NON verified friends
            db.manyOrNone('SELECT memberid_b FROM Contacts WHERE memberid_a=$1 AND verified=0 UNION SELECT memberid_a FROM Contacts WHERE memberid_b=$1 AND (verified=0 AND sentby<>$1)', [memberID])
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

//Get all requests sent by the user OUTGOING REQUESTS
router.post('/out', (req, res) => {
    let user = req.body['username'];
    //Get user id
    db.one('SELECT memberid FROM Members WHERE username LIKE $1', [user])
        .then(data => {
            let memberID = data['memberid'];
            //Find all NON verified friends
            db.manyOrNone('SELECT memberid_b FROM Contacts WHERE memberid_a=$1 AND verified=0 UNION SELECT memberid_a FROM Contacts WHERE memberid_b=$1 AND (verified=0 AND sentby=$1)', [memberID])
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

//Cancel an outgoing request
router.post('/out/cancel', (req, res) => {
    let user = req.body['username'];
    let friend = req.body['friend'];
    //Get member id of user
    db.one('SELECT memberid FROM Members WHERE username LIKE $1', [username])
        .then(data => {
            console.log("User id:" + data.memberid);
            //Get friend id
            db.one('SELECT memberid FROM Members WHERE username LIKE $1', [friend])
                .then(dataTwo => {
                    //Delete the row where the userid is the one who sent it, and the friend is in one of the columns
                    db.result('DELETE FROM Contacts WHERE sentby=$1 AND (memberid_a=$2 OR memberid_b=$2)', [data.memberid, dataTwo.memberid])
                        .then(result => {
                            console.log("Friend Request Cancelled");
                            res.send({
                                result: "true"
                            });
                        });
                });
        });
});

//ADD OR DECLINE END POINT BELOW
///////////////////////////////////////////
router.post('/ad', (req, res) => {
    let username = req.body['username'];
    let friend = req.body['friend'];
    let removeOrAdd = req.body['accept'];
    //If removeOrAdd = true, then add user. If false, then decline user (delete from table)
    if (removeOrAdd) {
        //VERIFY FRIEND
        db.one('SELECT memberid FROM Members WHERE username LIKE $1', [username])
            .then(data => {
                console.log("User id:" + data.memberid);
                db.one('SELECT memberid FROM Members WHERE username LIKE $1', [friend])
                    .then(dataTwo => {
                        db.result('UPDATE Contacts SET verified=1 WHERE (memberid_a=$1 OR memberid_b=$1) AND (memberid_a=$2 OR memberid_b=$2)', [data.memberid, dataTwo.memberid])
                            .then(result => {
                                //Good to go, verified the user
                                console.log("Verified Friend!");
                                res.send({
                                    result: "true"
                                });
                            })
                    })

            })
            .catch((err) => {
                res.send({
                    result: "false"
                });
            });
    } else {
        //DECLINE FRIEND
        db.one('SELECT memberid FROM Members WHERE username LIKE $1', [username])
            .then(data => {
                console.log("User id:" + data.memberid);
                db.one('SELECT memberid FROM Members WHERE username LIKE $1', [friend])
                    .then(dataTwo => {
                        db.result('DELETE FROM Contacts WHERE (memberid_a=$1 OR memberid_b=$1) AND (memberid_a=$2 OR memberid_b=$2)', [data.memberid, dataTwo.memberid])
                            .then(result => {
                                //Good to go, verified the user
                                console.log("User Declined!");
                                res.send({
                                    result: "true"
                                });
                            })
                    })

            })
            .catch((err) => {
                res.send({
                    result: "false"
                });
            });
    }
});
module.exports = router;