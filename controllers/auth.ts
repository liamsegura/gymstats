import passport from "passport";
import validator from "validator";
import User from "../models/User";
import cloudinary from "../middleware/cloudinary";

export default {
  getLogin: function (req:any, res:any) {
    if (req.user) {
      return res.redirect("/feed");
    }
    res.render("login", {
      title: "Login",
    });
  },

  postLogin: function (req:any, res:any, next:any) {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });
    if (validator.isEmpty(req.body.password))
      validationErrors.push({ msg: "Password cannot be blank." });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/login");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });

    passport.authenticate("local", (err:any, user:any, info:any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", info);
        return res.redirect("/login");
      }
      req.logIn(user, (err:any) => {
        if (err) {
          return next(err);
        }
        req.flash("success", { msg: "Success! You are logged in." });
        res.redirect(req.session.returnTo || "/feed");
      });
    })(req, res, next);
  },

  logout: function (req:any, res:any) {
    req.logout(() => {
      console.log("User has logged out.");
    });
    req.session.destroy((err:any) => {
      if (err)
        console.log(
          "Error: Failed to destroy the session during logout.",
          err
        );
      req.user = null;
      res.redirect("/");
    });
  },

  getSignup: function (req:any, res:any) {
    if (req.user) {
      return res.redirect("/feed");
    }
    res.render("signup", {
      title: "Create Account",
    });
  },

  postSignup: async function (req:any, res:any, next:any) {
    let user; // Declare user variable here
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });
    if (!validator.isLength(req.body.password, { min: 8 }))
      validationErrors.push({
        msg: "Password must be at least 8 characters long",
      });
    if (req.body.password !== req.body.confirmPassword)
      validationErrors.push({ msg: "Passwords do not match" });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("../signup");
    }

    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });

    try {
      if (req.file && req.file.path) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          transformation: [{ width: 200, height: 200, crop: "fill" }],
        });
        user = new User({
          userName: req.body.userName.toLowerCase(),
          email: req.body.email,
          password: req.body.password,
          profilePic: {
            url: result.secure_url,
            type: req.file.mimetype,
          },
          cloudinaryId: result.public_id,
          bodyweight: 0,
        });
      } else {
        user = new User({
          userName: req.body.userName.toLowerCase(),
          email: req.body.email,
          password: req.body.password,
          profilePic: {
            url: "",
            type: "image/jpeg",
          },
          bodyweight: 0,
        });
      }

      const existingUser = await User.findOne({
        $or: [
          { email: req.body.email },
          { userName: req.body.userName.toLowerCase() },
        ],
      });

      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }

      await user.save();
      req.logIn(user, async (err: any) => {
        if (err) {
          req.flash("errors", {
            msg:
              "An error occurred while logging in. Please try again later.",
          });
          return res.redirect("../login");
        }
        res.redirect("/feed");
      });
    } catch (err) {
      console.log("Error occurred while signing up user:", err);
      req.flash("errors", {
        msg: "An error occurred while signing up. Please try again later.",
      });
      res.redirect("../signup");
    }
  },
};
