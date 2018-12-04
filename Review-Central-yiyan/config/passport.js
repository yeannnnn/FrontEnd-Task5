'use strict';
var LocalStrategy = require("passport-local").Strategy;

var bcrypt = require('bcrypt-nodejs');
var db = require('../app/database');
const connection = db.connect();

connection.query('USE test');

module.exports = (passport) => {
 passport.serializeUser((user, done)=>{
  done(null, user.id);
 });

 passport.deserializeUser((id, done)=>{
  db.deSerial(connection,id,done);
 });

 passport.use(
  'local-signup',
  new LocalStrategy({
   usernameField : 'username',
   passwordField: 'password',
   passReqToCallback: true
  },
  (req, username, password, done)=>{
   connection.query("SELECT * FROM users1 WHERE username = ? ", 
   [username], (err, rows)=>{
    if(err)
     return done(err);
    if(rows.length){
     return done(null, false, req.flash('signupMessage', 'That is already taken'));
    }else{
     var newUserMysql = {
      username: username,
      password: bcrypt.hashSync(password, null, null)
     };

     var insertQuery = "INSERT INTO users1 (username, password) values (?, ?)";

     connection.query(insertQuery, [newUserMysql.username, newUserMysql.password],
      (err, rows)=>{
       newUserMysql.id = rows.insertId;

       return done(null, newUserMysql);
      });
    }
   });
  })
 );

 passport.use(
  'local-login',
  new LocalStrategy({
   usernameField : 'username',
   passwordField: 'password',
   passReqToCallback: true
  },
 (req, username, password, done)=>{
  db.logUser(req, connection, password, username, done);
  })
 );
};