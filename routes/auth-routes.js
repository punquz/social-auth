const router = require("express").Router();
const passport = require("passport");
const User = require('../models/user-model');
const bcrypt = require("bcryptjs");

// auth login
router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

//local login
router.get("/local-login", (req, res, next) => {
  res.render("local-login");
});

// auth logout
router.get("/logout", (req, res) => {
  // handle with passport
  req.logout();
  res.redirect("/");
});

// auth with google+
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

// auth with facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"]
  })
);

// auth with twitter
router.get("/twitter", passport.authenticate("twitter"));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect("/profile");
});

// callback route for facebook to redirect to
// hand control to passport to use code to grab profile info
router.get(
  "/facebook/redirect",
  passport.authenticate("facebook"),
  (req, res) => {
    res.redirect("/profile");
  }
);

// callback route for twitter to redirect to
// hand control to passport to use code to grab profile info
router.get(
  "/twitter/redirect",
  passport.authenticate("twitter"),
  (req, res) => {
    res.redirect("/profile");
  }
);

//local strategy registration
router.post("/local-register", (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check all fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  //password check
  if (password !== password2) {
    errors.push({ msg: "passwords do not match" });
  }

  //check for password length
  if (password.length < 6) {
    errors.push({ msg: "password must be at least of 6 character" });
  }
  if (errors.length > 0) {
    res.render("login", {
      errors,
      name,
      email,
      password,
      password2,
      user: req.user
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: "email is already in use" });
        res.render("login", {
          errors,
          name,
          email,
          password,
          password2,
          user: req.user
        });
      } else {
        const user = new User({
          username: req.body.name,
          email,
          password
        });
        //hash password
        bcrypt.genSalt(12, (err, salt) =>
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw new err();
            user.password = hash;

            //save user
            user
              .save()
              .then(user => {
                // req.flash("success_msg", "You are now registered");
                res.redirect("/auth/local-login");
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

//local login
router.post('/signin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
})

module.exports = router;
