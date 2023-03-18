const Comment = require("../models/Comments");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const PR = require("../models/PR");
const User = require("../models/User");

module.exports = {
  createComment: async (req, res) => {
    try {
      const comment = await Comment.create({
        comment: req.body.comment,
        likes: 0,
        post: req.params.id,
        user: req.user._id,
      });
  
      const post = await Post.findById(req.params.id);
      if (!post) {
        const pr = await PR.findById(req.params.id);
        if (pr && pr.user.toString() !== req.user._id.toString()) {
          console.log("true")
          const notification = new Notification({
            type: "comment",
            post: pr._id,
            onModel: 'PR',
            recipient: pr.user,
            generator: req.user._id,
            comment: comment._id,
            
          });
          await notification.save();
          await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: 1 } });
        }
      } else {
        if (post.user.toString() !== req.user._id.toString()) {
          const notification = new Notification({
            type: "comment",
            post: post._id,
            onModel: 'Post',
            recipient: post.user,
            generator: req.user._id,
            comment: comment._id,
          });
        
          await notification.save();
          await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: 1 } });
              }
      }
  
      console.log("Comment has been added!");
      res.redirect("/post/" + req.params.id);
    } catch (err) {
      console.log(err);
    }
  },
  







  // createComment: async (req, res) => {
  //   try {
  //     console.log(req.user)
  //     await Comment.create({
  //       comment: req.body.comment,
  //       likes: 0,
  //       post: req.params.id,
  //       user: req.user._id
  //     });
  //     console.log("Comment has been added!");
  //     res.redirect("/post/" + req.params.id);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      let post = await Post.findById(comment.post);
      if (!post) {
        post = await PR.findById(comment.post);
      }
  
      const deletedNotification = await Notification.deleteMany({ comment: req.params.id });
      if (deletedNotification) {
        await User.findByIdAndUpdate(post.user, { $inc: { unreadCount: -1 } });
      }
  
      await Comment.remove({ _id: req.params.id });
      console.log("Deleted Comment");
      res.redirect("/post/" + post._id.toString());
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },
  
}
  