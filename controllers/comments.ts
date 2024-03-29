import Comment from "../models/Comments"
import Notification from "../models/Notification"
import Post from "../models/Post"
import PR from "../models/PR"
import User from "../models/User"

export default {
  createComment: async (req: any, res: any) => {
    try {
      const { comment, parentComment, replyToUser } = req.body;

      console.log(req.body)
  
      let newComment;
      if (parentComment) {
        const parent = await Comment.findById(parentComment);
        if (!parent) {
          throw new Error("Parent comment not found");
        }
  
        newComment = new Comment({
          comment,
          likes: 0,
          post: parent.post,
          user: req.user._id,
          parentComment,
        });
  
        // Push the new comment into the replies property of the parent comment
        parent.replies.push(newComment);
        await parent.save();
          // Create a notification for the parent comment author
          const parentCommentAuthor = await User.findById(replyToUser);
          if (parentCommentAuthor && parentCommentAuthor._id.toString() !== req.user._id.toString()) {
              const notification:any = new Notification({
                  type: "reply",
                  post: parent.post,
                  recipient: replyToUser,
                  generator: req.user._id,
                  comment: newComment._id,
              });
              await notification.save();
              await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: 1 } });
          }
      } else {
        newComment = new Comment({
          comment,
          likes: 0,
          post: req.params.id,
          user: req.user._id,
        });
      }
  
      const savedComment:any= await newComment.save();
  
      // Create a notification if necessary
      const post = await Post.findById(savedComment.post);
      if (!post) {
        const pr = await PR.findById(savedComment.post);
        if (pr && pr.user.toString() !== req.user._id.toString()) {
          const notification:any = new Notification({
            type: "comment",
            post: pr._id,
            onModel: 'PR',
            recipient: pr.user,
            generator: req.user._id,
            comment: savedComment._id,
          });
          await notification.save();
          await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: 1 } });
        }
      } else {
        if (post.user.toString() !== req.user._id.toString()) {
          const notification:any = new Notification({
            type: "comment",
            post: post._id,
            onModel: 'Post',
            recipient: post.user,
            generator: req.user._id,
            comment: savedComment._id,
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
  


  deleteComment: async (req: any, res: any) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return { success: false, message: "Comment not found" };
      }
  
      const replyIds = comment.replies.map((reply:{_id:string}) => reply._id);

        // find all the replies and their corresponding users
        const replies = await Comment.find({ _id: { $in: replyIds } }).populate('user');

        // delete the replies
        await Promise.all([
          Comment.deleteMany({ _id: { $in: replyIds } }),
          comment.remove()
        ]);

        // delete notifications for the deleted replies
        await Notification.deleteMany({ comment: { $in: replyIds } });

        // update the unreadCount for each user who has a reply
        const userIds = new Set(replies.map((reply:any) => reply.user._id.toString()));
        for (const userId of userIds) {
          await User.findByIdAndUpdate(userId, { $inc: { unreadCount: -1 }  });
        }
  
  
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

  deleteReply: async (req: any, res: any) => {
    try {
  const replyId = req.params.id;
  const reply = await Comment.findByIdAndDelete(replyId)
  console.log(reply)
  let post = await Post.findById(reply.post);
      if (!post) {
        post = await PR.findById(reply.post);
      }

      // delete notification
      const notification = await Notification.findOneAndDelete({comment: replyId})
      await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: -1 } });

  console.log("Deleted Comment");
  res.redirect("/post/" + post._id.toString());
} catch (err) {
  console.log(err);
  res.redirect("/");
}
},
}
  