import mongoose from "mongoose"

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
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  replyToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  replies: [{ type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Comment", CommentSchema);

