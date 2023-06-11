const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true
  },
  media: {
    type: {
      type: String,
      enum: ["video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    }
  },
  caption: {
    type: String,
  },
  likes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    default: [],
  },
  bodyweight: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  reps: {
    type: Number,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
