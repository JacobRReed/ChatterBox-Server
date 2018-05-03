//Default


//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

var router = express.Router();

router.get("/params", (req, res) => { res.send({
  //req.query is a reference to arguments in the url
  message: "Hello, " + req.query['name'] + "!" });
});

router.post("/params", (req, res) => {

  res.send({
    //req.query is a reference to arguments in the POST body
    message: "Hello, " + req.body['name'] + "! You sent a POST Request"
  });
});


router.get("/wait", (req, res) => {
  setTimeout(() => {
    res.send({
      message: "Thanks for waiting"
    });
  }, 1000);
});

module.exports = router;
