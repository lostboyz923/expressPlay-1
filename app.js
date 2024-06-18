require("dotenv").config();
require("./routes/index"); // routes for sign-in

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("./config/passport");
var session = require("express-session"); // Require express-session
var User = require("./models/user");
var router = express.Router();

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var usersRouter = require("./routes/users"); // Ensure this file exists

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views")); // tells express where to find your webpage templates
app.set("view engine", "jade");

app.use(logger("dev")); // logs every incoming request
app.use(express.json()); // handles parsing data sent from forms
app.use(express.urlencoded({ extended: false })); // sets up session middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to false for development
  }),
);

app.use("/", indexRouter);
app.use("/", authRouter);

// Initialize Passport
app.use(passport.initialize()); // initialize passport to handle user authentication and session management
app.use(passport.session());

// Use routers
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter); // users login page

// Route middleware to ensure user is logged in
app.get("/login", function (req, res, next) {
  res.render("login"); // this route renders the login page when a user visits
});

// Authenticate the username and password when the user submits the form
app.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
);

// This line ensures that the user is authenticated for any subsequent requests
app.use(passport.authenticate("session"));

// Protect /pages route
app.get("/pages", passport.authenticate("session"), function (req, res, next) {
  res.send("Protected Page"); // Replace this with actual functionality
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404)); // this handles requests for pages that do not exist
});

// Error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app; // this makes your application available to other files
