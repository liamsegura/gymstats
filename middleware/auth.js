module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/dashboard");
    }
  },
  ensureUser: function (req, res, next) {
    // Check if the logged-in user id matches the user id in the request
    if (req.user.id.toString() !== req.params.id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }
};
