//Default

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

//express is the framework we're going to use to handle requests
const express = require('express');

//Create a new instance of express
const app = express();

const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());



var router = express.Router();

router.post("/", (req, res) => {
  var name = req.body['name'];
  if (name) {
    let params = [name];
    db.none("INSERT INTO DEMO(Text) VALUES ($1)", params)
    .then(() => {
      //We successfully addevd the name, let the user know
      res.send({
        success: true
      });
    }).catch((err) => {
      //log the error
      console.log(err);
      res.send({
        success: false,
        error: err
      });
    });
  } else {
    res.send({
      success: false,
      input: req.body,
      error: "Missing required information"
    });
  }
});

router.get("/", (req, res) => {

  db.manyOrNone('SELECT Text FROM Demo')
  //If successful, run function passed into .then()
  .then((data) => {
    res.send({
      success: true,
      names: data
    });
  }).catch((error) => {
    console.log(error);
    res.send({
      success: false,
      error: error
    })
  });
});

module.exports = router;
