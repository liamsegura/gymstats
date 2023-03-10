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
  },

  deleteComment: async (req, res) => {
 
    try {
      // Find post by id
      let post = await Comment.findById({ _id: req.params.id });
      
      console.log(post.post)
      // Delete post from db
      await Comment.remove({ _id: req.params.id });
      console.log("Deleted Comment");
      res.redirect("/post/" + post.post.toString());
    } catch (err) {
      res.redirect("/post/" + post.post.toString());
    }
  },
};