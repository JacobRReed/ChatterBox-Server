const pgp = require('pg-promise')();
//We have to set ssl usage to true for Heroku to accept our connection
pgp.pg.defaults.ssl = true;

//Create connection to Heroku Database
const db =
pgp('postgres://gxpvddwxxuwuyq:a9dcfc98e5128c2f698a436407ead8f3f80db028b582208170baa2e97ee82739@ec2-54-243-213-188.compute-1.amazonaws.com:5432/d2v0v9lfitrgc4');

if(!db) {
  console.log("SHAME! Follow the intructions and set your DATABASE_URL correctly");
  process.exit(1);
}

module.exports = db;
