//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
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

router.get("/getChat", (req, res) => {
  let chatId = req.query['chatId'];
  let after = req.query['after'];
  let query = `SELECT Distinct(Chats.Name)
    FROM Chats, Messages
    INNER JOIN Members ON Messages.MemberId=Members.MemberId
    WHERE Chats.ChatId=Messages.ChatId
    ORDER BY Chats.Name ASC`
  db.manyOrNone(query, [after, chatId])
  .then((rows) => {
    res.send({
      messages: rows
    })
  }).catch((err) => {
    res.send({
      success: false,
      error: err
    })
  });
});

module.exports = router;
