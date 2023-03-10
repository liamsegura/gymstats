const Comment = require("../models/Comments");

module.exports = {
  createComment: async (req, res) => {
    try {
      console.log(req.user)
      await Comment.create({
        comment: req.body.comment,
        likes: 0,
        post: req.params.id,
        user: req.user._id
      });
      console.log("Comment has been added!");
      res.redirect("/post/" + req.params.id);
    } catch (err) {
      console.log(err);
    }
  }
};