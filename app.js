const express = require('express');
const admin = require('sriracha');
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');

const app = express();

// set view engine

app.set('view engine', 'ejs');

//bodyparser
app.use(bodyParser.urlencoded({ extended: false }));

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));



 // initialize passport
 require('./config/passport-setup')(app);

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
    console.log('connected to mongodb');
});

//sriracha admin
app.use('/admin', admin());

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// create home route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

app.listen(3000, () => {
    console.log('app now listening for on port 3000');
});