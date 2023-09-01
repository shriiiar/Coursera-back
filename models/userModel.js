const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      default: "student",
      enum: ["student", "teacher", "admin"],
    },
    studentId: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    codeForces: {
      type: String,
      trim: true,
    },
    atCoder: {
      type: String,
      trim: true,
    },
    codeChef: {
      type: String,
      trim: true,
    },
    leetCode: {
      type: String,
      trim: true,
    },
    courseProgress: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: "courses",
        },
        progress: {
          type: Number,
          default: 0,
        },
      },
    ],
    specialist: {
      type: String,
      trim: true,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "courses",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Export User model
const User = mongoose.model("users", UserSchema);
module.exports = User;
