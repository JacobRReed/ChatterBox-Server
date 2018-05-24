//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
router.post("/sendMessages", (req, res) => {
  let username = req.body['username'];
  let message = req.body['message'];
  let chatId = req.body['chatId'];
  if(!username || !message || !chatId) {
    res.send({
      success: false,
      error: "Username, message, or chatId not supplied"
    });
    return;
  }
  let insert = 'INSERT INTO Messages(ChatId, Message, MemberId) SELECT $1, $2, MemberId FROM Members WHERE Username=$3'
  db.none(insert, [chatId, message, username])
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

router.get("/getMessages4", (req, res) => {
  let chatId = req.query['chatId'];
  let query = 'SELECT MESSAGE, TIMESTAMP, MEMBERID FROM MESSAGES WHERE CHATID = $1 ORDER BY TIMESTAMP ASC'
  db.manyOrNone(query, [chatId])
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

router.get("/getMessages", (req, res) => {
  let chatId = req.query['chatId'];
  let after = req.query['after'];
  let query = `SELECT Members.Username, Messages.Message, to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD
    HH24:MI:SS.US' )
    AS Timestamp
    FROM Messages
    INNER JOIN Members ON Messages.MemberId=Members.MemberId WHERE ChatId=$2
    Timestamp AT TIME ZONE 'PDT' > $1
    ORDER BY Timestamp ASC`
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

router.get("/getMessages3", (req, res) => {
  let chatId = req.query['chatId'];
  let after = req.query['after'];
  let query = `SELECT Members.Username, Messages.Message, to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD
HH24:MI:SS.US' )
AS Timestamp
FROM Messages
INNER JOIN Members ON Messages.MemberId=Members.MemberId WHERE ChatId=$2 AND
Timestamp AT TIME ZONE 'PDT' > $1
ORDER BY Timestamp ASC`
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


router.get("/getMessages2", (req, res) => {
  let chatId = req.query['chatId'];
  let query = `SELECT Members.Username, Messages.Message, to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD
    HH24:MI:SS.US' )
    AS Timestamp
    FROM Messages
    INNER JOIN Members ON Messages.MemberId=Members.MemberId WHERE ChatId=$1
    ORDER BY Timestamp ASC`
  db.manyOrNone(query, [chatId])
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
