//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

var hello = require('./routes/hello.js');
app.use('/hello', hello);

var params = require('./routes/params.js');
app.use('/params', params);

var demosql = require('./routes/demosql.js');
app.use('/demosql', demosql);

var wait = require('./routes/wait.js');
app.use('/wait', wait);

var login = require('./routes/login.js');
app.use('/login', login);

var reg = require('./routes/register.js');
app.use('/register', reg);

var msg = require('./routes/messages.js');
app.use('/', msg);

var friends = require('./routes/friends.js');
app.use('/friends', friends);

var invite = require('./routes/invite.js');
app.use('/invite', invite);

var requests = require('./routes/requests.js');
app.use('/requests', requests);

var chats = require('./routes/chats.js');
app.use('/chats', chats);

var contacts = require('./routes/contacts.js');
app.use('/contacts', contacts);

var search = require('./routes/search.js');
app.use('/search', search);

var resetpassword = require('./routes/resetpassword.js');
app.use('/resetpassword', resetpassword);

var validateregistration = require('./routes/validateregistration.js');
app.use('/validateregistration', validateregistration);

/*
 * Return HTML for the / end point.
 * This is a nice location to document your web service API
 * Create a web page in HTML/CSS and have this end point return it.
 * Look up the node module 'fs' ex: require('fs');
 */
app.get("/", (req, res) => {
    var fs = require('fs');
    var html = fs.readFileSync('./home.html', 'utf8');
    res.send(html);
});

/*
 * Heroku will assign a port you can use via the 'PORT' environment variable To accesss
 * an environment variable, use process.env.<ENV> If there isn't an environment
 * variable, process.env.PORT will be null (or undefined) If a value is 'falsy', i.e.
 * null or undefined, javascript will evaluate the rest of the 'or'
 * In this case, we assign the port to be 5000 if the PORT variable isn't set
 * You can consider 'let port = process.env.PORT || 5000' to be equivalent to:
 * let port; = process.env.PORT;
 * if(port == null) {port = 5000}
 */
app.listen(process.env.PORT || 5000, () => {
    console.log("Server up and running on port: " + (process.env.PORT || 5000));
});

//---------------------------------