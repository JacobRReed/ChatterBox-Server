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
        let user = req.body['user'];
        let subjectLine = user + " sent you an invite to use ChatterBox!";
        let bodyText = "You have been invited to use a great chat app, ChatterBox!";
        let htmlText = "<strong>You</strong> have been invited to use a great chat app, <strong>ChatterBox</strong>!";

        const msg = {
            to: emailAddr,
            from: 'chatterbox@uw.edu',
            subject: subjectLine,
            text: bodyText,
            html: htmlText,
        };

        sgMail.send(msg);
        res.send({
            result: true
        });
    })
    .catch((err) => {
        res.send({
            result: false
        })));

module.exports = router;