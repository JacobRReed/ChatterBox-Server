//Default

//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

var router = express.Router();

/*
* Hello world functions below...
*/
router.get("/", (req, res) => {
  res.send({
    message: "Hello, you sent a GET request"
  });
});

router.post("/", (req, res) => {
  res.send({
    message: "Hello, you sent a POST request"
  });
});

module.exports = router;
