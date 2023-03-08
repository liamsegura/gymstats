const mongoose = require("mongoose");

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
    }
  },
  caption: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  catagory: {
    type:String,
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

module.exports = mongoose.model("PR", PRSchema);
