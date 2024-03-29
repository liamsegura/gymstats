import mongoose from "mongoose"

const PRSchema = new mongoose.Schema({
  
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
    required: true,
  },
  likes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    default: [],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type:String,
    required: true,
  },
  bodyweight: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
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

export default mongoose.model("PR", PRSchema);
