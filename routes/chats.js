//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
// done
router.post("/makeChat", (req, res) => {
  let name = req.body['name'];
  // let message = req.body['message'];
  // let chatId = req.body['chatId'];
  if(!name) {
    res.send({
      success: false,
      error: "Name not supplied"
    });
    return;
  }
  let insert = 'INSERT INTO Chats(Name) VALUES($1)'
  db.none(insert, [name])
    .then(() => {
      res.send({
        success: true
      });
    }).catch((err) => {
      res.send({
        success: false,
        error: err,
    });
  });
});

//done
router.post("/getChat", (req, res) => {
  let name = req.body['name']
  let query = `SELECT chatID FROM CHATS WHERE NAME = $1`
  db.one(query, [name])
  .then((row) => {
    // let chatId = row['chatID']
    res.send({
      name: row
    })
  }).catch((err) => {
    res.send({
      success: false,
      error: err
    })
  });
});

// done
var router = express.Router();
router.post("/addFriendToChat", (req, res) => {
  let chatid = req.body['chatid'];
  let memid = req.body['memid'];
  db.none('INSERT INTO CHATMEMBERS(CHATID, MEMBERID) VALUES(' + chatid + ', ' + memid + ')')
    .then(() => {
      res.send({
        success: true
      });
    }).catch((err) => {
      res.send({
        success: false,
        error: "the thing you typed in were: " + chatid + " and " + memid,
    });
  });
});


//done
router.post("/getMemberID", (req, res) => {
  let name = req.body['name']
  let query = `SELECT MEMBERID FROM MEMBERS WHERE LOWER(USERNAME) = LOWER($1)`
  db.one(query, [name])
  .then((row) => {
    // let chatId = row['chatID']
    res.send({
      name: row
    })
  }).catch((err) => {
    res.send({
      success: false,
      error: err
    })
  });
});



module.exports = router;
