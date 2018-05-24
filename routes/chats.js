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
  let insert = 'INSERT INTO Chats(Name) VALUES($1) RETURNING chatid'
  db.one(insert, [name])
    .then((chatid) => {
      res.send({
        success: true,
        chatid: chatid
      });
    }).catch((err) => {
      res.send({
        success: false,
        error: err,
    });
  });
});

router.post("/deleteChat", (req, res) => {
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
  let insert = 'DELETE FROM Chats WHERE name = ' + name;
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

// done
//var router = express.Router();
router.post("/addFriendToChat", (req, res) => {
  let chatid = req.body['chatid'];
  let username = req.body['username'];
  db.none('INSERT INTO CHATMEMBERS(CHATID, MEMBERID) VALUES(' + chatid + ', (SELECT MEMBERID FROM MEMBERS WHERE LOWER(USERNAME) = LOWER('+ username +')))')
    .then(() => {
      res.send({
        success: true
      });
    }).catch((err) => {
      res.send({
        success: false,
        error: "the thing you typed in were: " + chatid + " and " + username,
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

router.post("/getChat", (req, res) => {
  let name = req.body['name']
  let query = `SELECT CHATID FROM CHATS WHERE LOWER(NAME) = LOWER($1)`
  db.one(query, [name])
  .then((row) => {
    // let chatId = row['chatID']
    res.send({
      name: row
    });
  }).catch((err) => {
    res.send({
      success: false,
      error: "THE NAME IS: " + name
    });
  });
});


// router.post("/MakeAndAddToChat", (req, res) => {
//   let chatname = req.body['chatname'];
//   let username = req.body['username'];
//   let friendUsername = req.body['friendUsername'];
//   db.none('INSERT INTO Chats(Name) VALUES($1) ', [chatname])
//     .then(() => {
//       db.none('INSERT INTO CHATMEMBERS(CHATID, MEMBERID) VALUES((SELECT chatID FROM CHATS WHERE NAME = $1), (SELECT MEMBERID FROM MEMBERS WHERE LOWER(USERNAME) = LOWER($2)))', [chatname, username])
//         .then(() => {
//           db.none('INSERT INTO CHATMEMBERS(CHATID, MEMBERID) VALUES((SELECT chatID FROM CHATS WHERE NAME = $1), (SELECT MEMBERID FROM MEMBERS WHERE LOWER(USERNAME) = LOWER($2)))', [chatname, friendUsername])
//             .then(() => {
//               res.send({
//                 success: true
//               });
//             }).catch((err) => {
//               res.send({
//                 success: false,
//                 error: 'ERROR 3: ' + friendUsername,
//             });
//           });
//         }).catch((err) => {
//           res.send({
//             success: false,
//             error: 'ERROR 2: ' + username,
//         });
//       });
//     }).catch((err) => {
//       res.send({
//         success: false,
//         error: 'ERROR 1: ' + chatname,
//     });
//   });
// });


//---------------

// var router = express.Router();
// router.post("/MakeAndAddToChat", (req, res) => {
//   let chatname = req.body['chatname'];
//   let username = req.body['username'];
//   let friendUsername = req.query['friendUsername'];
//   db.one('INSERT INTO Chats(Name) VALUES($1) RETURNING chatid', [chatname])
//     .then((row) => {
//       let chatid = row.chatid;
//       for(let i = 0; i < numberOfFriends; i++) {
//         db.none('INSERT INTO CHATMEMBERS(CHATID, MEMBERID) VALUES($1, (SELECT MEMBERID FROM MEMBERS WHERE LOWER(USERNAME) = LOWER($2)))', [chatid, friendUsername])
//         .then(() => {
//           res.send({
//             success: true
//           });
//         }).catch((err) => {
//           res.send({
//             success: false,
//             error: 'ERROR 2: ' + friendUsername,
//           });
//         });
//       }
      
      
//     }).catch((err) => {
//       res.send({
//         success: false,
//         error: 'ERROR 1: ' + chatname,
//     });
//   });
// });

//-----

router.post("/getAllChats", (req, res) => {
  let name = req.body['name']
  let usernamesOfChats = [];
  db.manyOrNone('SELECT CHATS.NAME FROM CHATS, CHATMEMBERS WHERE CHATS.CHATID = CHATMEMBERS.CHATID AND MEMBERID = (SELECT MEMBERID FROM MEMBERS WHERE LOWER(USERNAME) = LOWER($1))', [name])
  .then((data) => {
    for (i = 0; i < data.length; i++) {
        usernamesOfChats.push(data[i].name);
    }
    res.send({
      name: usernamesOfChats
    });
  }).catch((err) => {
    res.send({
      success: false,
      error: "THE NAME IS: " + name
    });
  });
});


module.exports = router;
