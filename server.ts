import express from "express"
const app = express();
import mongoose from "mongoose"
import passport from "passport"
import session from "express-session"
import connectMongo from "connect-mongo"
const MongoStore = connectMongo(session);
import methodOverride from "method-override"
import flash from "express-flash"
import logger from "morgan"
import connectDB from "./config/database"
import mainRoutes from "./routes/main"
import postRoutes from "./routes/posts"
import prRoutes from "./routes/prs"
import commentRoutes from "./routes/comments"
import userRoutes from "./routes/users"
import notificationsMiddleware from './middleware/notifications'


// //Use .env file in config folder
// require("dotenv").config({ path: "./config/.env" });


import dotenv from 'dotenv'
dotenv.config({ path: "./config/.env" })
import myFunc from './config/passport'
// Passport config
myFunc(passport);


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
