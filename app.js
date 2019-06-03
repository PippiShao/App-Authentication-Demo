const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");

mongoose.connect("mongodb://localhost/auth_demo_app",  {useNewUrlParser: true});

const app = express();
app.use(require("express-session")({
    secret: "Cats are cute",
    resave: false,
    saveUninitialized: false
}));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({extended: true}));
app.set('view engine', "ejs");
app.use(passport.initialize());
app.use(passport.session());

//====================
// Routes
//====================
app.get("/", function(req, res){
    res.render("home");
});

// isLoggedIn is a middleware checking whether the user is logged in
app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
});

// Auth Routes
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secret");
        })
    })
});

// login routes
// render login form
app.get("/login", function(req, res){
    res.render("login");
});

// middleware : code run before final call back
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req,res) {
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// adding middleware checking if user if logged in
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3001, 'localhost', function(){
    console.log("server start");
});
