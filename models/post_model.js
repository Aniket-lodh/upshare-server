import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: [true, "Post caption is required"],
    maxlength: [500, "Caption cannot exceed 500 characters"],
  },
  image: {
    type: String,
    required: [true, "Post image is required"],
  },
  tags: {
    type: [String],
    default: [],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "Post must belong to an author"],
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ likes: 1 });

// Pre-save hook to update updatedAt
postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Post = mongoose.model("post", postSchema);
