//Default


//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

var router = express.Router();

router.get("/", (req, res) => {
  res.send({
    //req.query is a reference to arguments in the url
    message: "Hello, " + req.query['name'] + "!"
  });
});

router.post("/", (req, res) => {
  res.send({
    //req.query is a reference to arguments in the POST body
    message: "Hello, " + req.body['name'] + "! You sent a POST Request"
  });
});

module.exports = router;
