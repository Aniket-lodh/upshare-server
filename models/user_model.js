import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

/**
 * The format of the user Model.
 * Creating a new instance of the mongoose schema class
 **/
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    minlength: [6, "Minimum length 6 characters."],
    maxlength: [15, "Maximum length 15 characters"],
  },
  username: {
    type: String,
    lowercase: true,
    default: function () {
      return this.name.split(" ").join("");
    },
  },
  profilephoto: {
    type: String,
    default: "userAvatar.jpg",
  },
  profession: {
    type: "String",
  },
  bio: {
    type: "string",
    maxlength: [150, "Max length reached!"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: String,
    minlength: [10, "Minimum length 10"],
    maxlength: [10, "Maximum length 10"],
  },
  location: {
    type: String,
  },
  passcode: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: [8, "Password cannot be lower than 8"],
    select: false, //hides the password
  },
  passcodeConfirm: {
    type: String,
    required: [true, "Please confirm your passcode"],
    minlength: [8, "Password cannot be lower than 8"],
    validate: {
      validator: function (el) {
        return el === this.passcode;
      },
      message: "Passwords do not match!",
    },
  },
  passcodeChangedAt: {
    type: Date,
  },
  likes: {
    type: Array,
    default: undefined,
  },
  Followers: {
    type: Array,
    default: undefined,
  },
  Following: {
    type: Array,
    default: undefined,
  },
//   listings: {
//     type: [ObjectId],
//     default: undefined,
//   },
  createdAt: {
    type: String,
    default: function () {
      return Math.floor(new Date().getTime() / 1000);
    },
  },
  updatedAt: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  this.passcode = await bcrypt.hash(this.passcode, 10);
  //   delete password confirm
  this.passcodeConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// 1st parameter in model stands for the database table name in mongodb
export const user = mongoose.model("user", userSchema);
