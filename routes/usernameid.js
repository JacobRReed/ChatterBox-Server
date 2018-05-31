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

router.post('/', (req,res) => {
    let id = req.body['username'];
    db.one('SELECT memberid FROM Members WHERE username LIKE($1)', [username])
    .then(result => {
        res.send({
            id: result
        });
    }).catch(err => {
        res.send({
            success: false,
            error: err
        });
    });
});

module.exports = router;