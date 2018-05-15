//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());
var router = express.Router();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', (req, res) => {
    let emailAddr = req.body['emailAddress'];
    let subjectLine = " You have registered with Chatterbox!";
    let bodyText = "You have registered for a great chat app, ChatterBox!";
    let htmlText = "<strong>You</strong> have registered for a great chat app, <strong>ChatterBox</strong>!";

    const msg = {
        to: emailAddr,
        from: 'chatterbox@uw.edu',
        subject: subjectLine,
        text: bodyText,
        html: htmlText,
    };

    sgMail.send(msg);
    res.send({
        result: "true"
    });
});


module.exports = router;