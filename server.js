const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");
const prRoutes = require("./routes/prs");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");
const notificationsMiddleware = require('./middleware/notifications');


//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);


//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("public"));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//Body Parsing

app.use(express.json());
app.use(express.json({limit: '80mb'}));
app.use(express.urlencoded({limit: '80mb'}));

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
//notification middleware
app.use(notificationsMiddleware);


//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);
app.use("/pr", prRoutes);
app.use("/comment", commentRoutes);
app.use("/users", userRoutes);

//Server Running
connectDB().then(() => {
  
  app.listen(process.env.PORT, () => {
      console.log("listening for requests");
  })
}
)

// })
// app.listen(process.env.PORT, () => {
//   console.log("Server is running, you better catch it!");
// });
