const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const keys = require('../keys');
const User = require('../../models/user-model');

module.exports = function() {
    passport.use(
        new FacebookStrategy({
            // options for facebook strategy
            clientID: keys.facebook.clientID,
            clientSecret: keys.facebook.clientSecret,
            callbackURL: '/auth/facebook/redirect'
        }, (accessToken, refreshToken, profile, done) => {
            // check if user already exists in our own db
            User.findOne({socialId: profile.id}).then((currentUser) => {
                if(currentUser){
                    // already have this user
                    console.log('user is: ', currentUser);
                    done(null, currentUser);
                } else {
                    // if not, create user in our db
                    new User({
                        socialId: profile.id,
                        username: profile.displayName
                    }).save().then((newUser) => {
                        console.log('created new user: ', newUser);
                        done(null, newUser);
                    });
                }
            });
        })
    );
};
  