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

    console.log(user);

    if (user) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT memberid FROM Members WHERE username=$1', [user])
            //If successful, run function passed into .then()
            .then(row => {
                let memberID = row['memberid'];
                db.manyOrNone('SELECT memberid_b FROM Contacts WHERE memberid_a=$1 UNION SELECT memberid_a FROM Contacts WHERE memberid_b=$1', [memberID])
                    .then(row => {
                        let friends = row['memberid'];
                        res.send({
                            friend: friends
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
    } else {
        res.send({
            success: false,
            message: 'missing credentials'
        });
    }
});

module.exports = router;