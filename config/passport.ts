import { Strategy as LocalStrategy } from "passport-local";
import mongoose from "mongoose"
import User from "../models/User"


export default function (passport:any) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done:any) => {
      User.findOne({ email: email.toLowerCase() }, (err:any, user:any) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` });
        }
        if (!user.password) {
          return done(null, false, {
            msg:
              "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.",
          });
        }
        user.comparePassword(password, (err:any, isMatch:any) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(null, user);
          }
          return done(null, false, { msg: "Invalid email or password." });
        });
      });
    })
  );

  passport.serializeUser((user:{id:string}, done:any) => {
    done(null, user.id);
  });

  passport.deserializeUser((id:string, done:any) => {
    User.findById(id, (err:any, user:any) => done(err, user));
  });
};
