const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const keys = require('../keys');
const User = require('../../models/user-model');

module.exports = function() {
    passport.use(
        new TwitterStrategy({
            // options for google strategy
            consumerKey: keys.twitter.consumerKey,
            consumerSecret: keys.twitter.consumerSecret,
            callbackURL: '/auth/twitter/redirect'
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
                        username: profile.displayName,
                        email: profile.email
                    }).save().then((newUser) => {
                        console.log('created new user: ', newUser);
                        done(null, newUser);
                    });
                }
            });
        })
    );
};
  