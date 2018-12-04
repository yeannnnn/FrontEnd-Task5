var db = require('../app/database');

const multer = require('multer');
const resize = require('../app/resize');
const upload = multer({ dest: 'public/uploads/' });
const connection = db.connect();

const cb = (result, res) => {
    res.send(result);
  };

connection.query('USE test');
//everything is exported
module.exports = (app, passport) => {
 //main site
 
    app.get('/', (req, res) =>{
  res.render('index.ejs');
 });

 //when login is pressed this will start and it renders login.ejs view.
 app.get('/login', (req, res) => {
  res.render('login.ejs', {message:req.flash('loginMessage')});
 });
//login if succes or failure
 app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/Mainfeed',
  failureRedirect: '/login',
  failureFlash: true
 }),(req, res) =>{
   if(req.body.remember){
    req.session.cookie.maxAge = 1000 * 60 * 3;
   }else{
    req.session.cookie.expires = false;
   }
   res.redirect('/');
  });
//signup site where user are created. first renders the signup.ejs page
 app.get('/signup', (req, res) =>{
  res.render('signup.ejs', {message: req.flash('signupMessage')});
 });
//redirect depends if succes or failure
 app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/Mainfeed',
  failureRedirect: '/signup',
  failureFlash: true
 }));
//if user isLoggedIN, will render the main feed page where reviews are created
 app.get('/Mainfeed', isLoggedIn, (req, res) =>{
  res.render('Mainfeed.ejs');
 });

//Start the main feed



//upload--happens in the main feed
app.post('/upload', upload.single('mediafile'), (req, res, next) => {
  next();
});
app.use('/upload', (req, res, next) => {
  resize.doResize(req.file.path, 300,
    './public/thumbs/' + req.file.filename + '_thumb', next);
});
app.use('/upload', (req, res, next) => {
  resize.doResize(req.file.path, 640,
    './public/medium/' + req.file.filename + '_medium', next);
});
// insert to database
app.use('/upload', (req, res, next) => {
  console.log('insert is here');
  const data = [
    req.body.product,
    req.body.price,
    req.body.year,
    req.body.star,
    req.body.model,
    req.file.filename + '_thumb',
    req.file.filename + '_medium',
    req.file.filename + '.jpg',
  ];
  db.insert(data, connection);
  
});

//profile page
 app.get('/profile', (req,res) => {
     res.render('profile');
 });
 //get the right profile
 app.get('/users', (req, res) => { 
    console.log(req.query); 
    db.getAllUser(connection, cb, res);
  });
//logout whenever /logout is pressed
 app.get('/logout', (req,res) =>{
  req.logout();
  res.redirect('/');
 })
};
//function to determinate if user is logged in or out.
function isLoggedIn(req, res, next){
 if(req.isAuthenticated())
  return next();

 res.redirect('/');
}