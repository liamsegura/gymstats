const mongoose = require("mongoose");
const Notification = require('./Notification');

const CommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

// CommentSchema.pre('save', async function (next) {
//   try {
//     // Check if this is a new comment
//     if (!this.isNew) {
//       return next();
//     }

//     // Find the post and its user in both the Post and PR collections
//     const postInPost = await mongoose.model('Post').findById(this.post);
//     const postInPR = await mongoose.model('PR').findById(this.post);
//     const post = postInPost || postInPR;
//     const user = await mongoose.model('User').findById(post.user);

//     // Create a new notification for the post user
//     if (user.toString() !== this.user.toString()) {
//       const notification = new Notification({
//         generator: this.user,
//         recipient: user,
//         post: this.post,
//         comment: this._id,
//         type: 'comment',
//       });
//       await notification.save();
//     }

//     next();
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

module.exports = mongoose.model("Comment", CommentSchema);



// const mongoose = require("mongoose");

// const CommentSchema = new mongoose.Schema({
//   comment: {
//     type: String,
//     required: true,
//   },
//   likes: {
//     type: Number,
//     required: true,
//   },
//   post: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Post",
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   read: {
//     type: Boolean,
//     default: false,
//   },
// });

// module.exports = mongoose.model("Comments", CommentSchema);
